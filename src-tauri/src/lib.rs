mod database;
#[cfg(test)]
mod test_utils;
#[cfg(test)]
mod api_tests;

use database::Database;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// Application state to hold database connection
pub struct AppState {
    pub db: Arc<Database>,
}

// Utility functions
fn count_words(text: &str) -> i32 {
    text.split_whitespace().count() as i32
}

fn count_characters(text: &str) -> i32 {
    text.chars().count() as i32
}

fn sanitize_content(content: &str) -> String {
    // Basic sanitization - remove null bytes and normalize line endings
    content.replace('\0', "").replace("\r\n", "\n").replace('\r', "\n")
}

// Note management commands
#[tauri::command]
async fn create_note(
    title: String,
    content: String,
    collection_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<Note, String> {
    let pool = state.db.pool();
    let id = Uuid::new_v4().to_string();
    let sanitized_content = sanitize_content(&content);
    let word_count = count_words(&sanitized_content);
    let character_count = count_characters(&sanitized_content);
    let now = Utc::now();
    let tags = "[]"; // Empty JSON array for tags
    
    let note = sqlx::query_as::<_, Note>(
        r#"
        INSERT INTO notes (id, title, content, collection_id, tags, created_at, updated_at, word_count, character_count, is_archived)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&title)
    .bind(&sanitized_content)
    .bind(&collection_id)
    .bind(tags)
    .bind(&now)
    .bind(&now)
    .bind(word_count)
    .bind(character_count)
    .bind(false)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to create note: {}", e))?;
    
    Ok(note)
}

#[tauri::command]
async fn update_note(
    id: String,
    content: String,
    state: State<'_, AppState>,
) -> Result<Note, String> {
    let pool = state.db.pool();
    let sanitized_content = sanitize_content(&content);
    let word_count = count_words(&sanitized_content);
    let character_count = count_characters(&sanitized_content);
    let now = Utc::now();
    
    let note = sqlx::query_as::<_, Note>(
        r#"
        UPDATE notes 
        SET content = ?1, updated_at = ?2, word_count = ?3, character_count = ?4
        WHERE id = ?5
        RETURNING *
        "#,
    )
    .bind(&sanitized_content)
    .bind(&now)
    .bind(word_count)
    .bind(character_count)
    .bind(&id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to update note: {}", e))?;
    
    Ok(note)
}

#[tauri::command]
async fn delete_note(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db.pool();
    
    let result = sqlx::query("DELETE FROM notes WHERE id = ?1")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete note: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Note with id {} not found", id));
    }
    
    Ok(())
}

#[tauri::command]
async fn get_note(id: String, state: State<'_, AppState>) -> Result<Note, String> {
    let pool = state.db.pool();
    
    let note = sqlx::query_as::<_, Note>("SELECT * FROM notes WHERE id = ?1")
        .bind(&id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to get note: {}", e))?;
    
    Ok(note)
}

#[tauri::command]
async fn get_all_notes(state: State<'_, AppState>) -> Result<Vec<Note>, String> {
    let pool = state.db.pool();
    
    let notes = sqlx::query_as::<_, Note>("SELECT * FROM notes WHERE is_archived = FALSE ORDER BY updated_at DESC")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to get notes: {}", e))?;
    
    Ok(notes)
}

// Collection management commands
#[tauri::command]
async fn create_collection(
    name: String,
    description: Option<String>,
    parent_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<Collection, String> {
    let pool = state.db.pool();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    // Get the next sort order for this parent
    let sort_order = if let Some(ref parent) = parent_id {
        let (max_order,): (Option<i32>,) = sqlx::query_as(
            "SELECT MAX(sort_order) FROM collections WHERE parent_id = ?1"
        )
        .bind(parent)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to get sort order: {}", e))?;
        
        max_order.unwrap_or(0) + 1
    } else {
        let (max_order,): (Option<i32>,) = sqlx::query_as(
            "SELECT MAX(sort_order) FROM collections WHERE parent_id IS NULL"
        )
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to get sort order: {}", e))?;
        
        max_order.unwrap_or(0) + 1
    };
    
    let collection = sqlx::query_as::<_, Collection>(
        r#"
        INSERT INTO collections (id, name, description, parent_id, sort_order, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&name)
    .bind(&description)
    .bind(&parent_id)
    .bind(sort_order)
    .bind(&now)
    .bind(&now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to create collection: {}", e))?;
    
    Ok(collection)
}

#[tauri::command]
async fn update_collection(
    id: String,
    name: String,
    description: Option<String>,
    state: State<'_, AppState>,
) -> Result<Collection, String> {
    let pool = state.db.pool();
    let now = Utc::now();
    
    let collection = sqlx::query_as::<_, Collection>(
        r#"
        UPDATE collections 
        SET name = ?1, description = ?2, updated_at = ?3
        WHERE id = ?4
        RETURNING *
        "#,
    )
    .bind(&name)
    .bind(&description)
    .bind(&now)
    .bind(&id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to update collection: {}", e))?;
    
    Ok(collection)
}

#[tauri::command]
async fn delete_collection(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db.pool();
    
    // Check if collection has child collections
    let (child_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM collections WHERE parent_id = ?1")
        .bind(&id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to check child collections: {}", e))?;
    
    if child_count > 0 {
        return Err("Cannot delete collection with child collections".to_string());
    }
    
    // Move notes in this collection to no collection
    sqlx::query("UPDATE notes SET collection_id = NULL WHERE collection_id = ?1")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to update notes: {}", e))?;
    
    let result = sqlx::query("DELETE FROM collections WHERE id = ?1")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete collection: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Collection with id {} not found", id));
    }
    
    Ok(())
}

#[tauri::command]
async fn get_collection(id: String, state: State<'_, AppState>) -> Result<Collection, String> {
    let pool = state.db.pool();
    
    let collection = sqlx::query_as::<_, Collection>("SELECT * FROM collections WHERE id = ?1")
        .bind(&id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to get collection: {}", e))?;
    
    Ok(collection)
}

#[tauri::command]
async fn get_all_collections(state: State<'_, AppState>) -> Result<Vec<Collection>, String> {
    let pool = state.db.pool();
    
    let collections = sqlx::query_as::<_, Collection>(
        "SELECT * FROM collections ORDER BY parent_id, sort_order"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get collections: {}", e))?;
    
    Ok(collections)
}

#[tauri::command]
async fn move_note_to_collection(
    note_id: String,
    collection_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let pool = state.db.pool();
    let now = Utc::now();
    
    let result = sqlx::query(
        "UPDATE notes SET collection_id = ?1, updated_at = ?2 WHERE id = ?3"
    )
    .bind(&collection_id)
    .bind(&now)
    .bind(&note_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to move note: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Note with id {} not found", note_id));
    }
    
    Ok(())
}

// Search and filtering commands
#[tauri::command]
async fn search_notes(
    query: String,
    _filters: Option<SearchFilters>,
    state: State<'_, AppState>,
) -> Result<Vec<SearchResult>, String> {
    let pool = state.db.pool();
    
    if query.trim().is_empty() {
        return Ok(vec![]);
    }
    
    // For now, use a simpler approach with basic search (without complex filtering)
    let search_results = sqlx::query_as::<_, (String, String, String, DateTime<Utc>, String, f64)>(
        r#"
        SELECT n.id, n.title, n.content, n.updated_at,
               snippet(notes_fts, 1, '<mark>', '</mark>', '...', 32) as excerpt,
               rank as relevance_score
        FROM notes_fts 
        JOIN notes n ON notes_fts.rowid = n.rowid
        WHERE notes_fts MATCH ?1 AND n.is_archived = FALSE
        ORDER BY rank
        LIMIT 50
        "#
    )
    .bind(&query)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to search notes: {}", e))?;
    
    let results = search_results
        .into_iter()
        .map(|(id, title, content, updated_at, excerpt, relevance_score)| {
            // Extract highlights from the content
            let highlights = extract_highlights(&content, &query);
            
            SearchResult {
                note_id: id,
                title: title.clone(),
                excerpt: excerpt.clone(),
                highlights,
                relevance_score,
                last_modified: updated_at,
            }
        })
        .collect();
    
    Ok(results)
}

fn extract_highlights(content: &str, query: &str) -> Vec<String> {
    let query_terms: Vec<&str> = query.split_whitespace().collect();
    let mut highlights = Vec::new();
    
    for term in query_terms {
        if content.to_lowercase().contains(&term.to_lowercase()) {
            // Find context around the term
            if let Some(pos) = content.to_lowercase().find(&term.to_lowercase()) {
                let start = pos.saturating_sub(30);
                let end = (pos + term.len() + 30).min(content.len());
                let context = &content[start..end];
                highlights.push(format!("...{}...", context));
            }
        }
    }
    
    highlights
}

#[tauri::command]
async fn get_recent_searches(_state: State<'_, AppState>) -> Result<Vec<String>, String> {
    // For now, return empty array. In a full implementation, 
    // you'd store recent searches in a separate table
    Ok(vec![])
}

#[tauri::command]
async fn save_recent_search(_query: String, _state: State<'_, AppState>) -> Result<(), String> {
    // For now, do nothing. In a full implementation,
    // you'd save the search query to a recent_searches table
    Ok(())
}

// File operations and storage management
#[tauri::command]
async fn export_notes(
    format: String,
    note_ids: Vec<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let pool = state.db.pool();
    
    if note_ids.is_empty() {
        return Err("No notes selected for export".to_string());
    }
    
    // Get the notes to export
    let placeholders = note_ids.iter()
        .enumerate()
        .map(|(i, _)| format!("?{}", i + 1))
        .collect::<Vec<_>>()
        .join(", ");
    
    let query_str = format!("SELECT * FROM notes WHERE id IN ({}) ORDER BY created_at", placeholders);
    let mut query = sqlx::query_as::<_, Note>(&query_str);
    
    for note_id in &note_ids {
        query = query.bind(note_id);
    }
    
    let notes = query
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to fetch notes for export: {}", e))?;
    
    match format.as_str() {
        "markdown" => export_as_markdown(notes),
        "json" => export_as_json(notes),
        _ => Err(format!("Unsupported export format: {}", format)),
    }
}

fn export_as_markdown(notes: Vec<Note>) -> Result<String, String> {
    let mut markdown = String::new();
    
    for note in notes {
        markdown.push_str(&format!("# {}\n\n", note.title));
        markdown.push_str(&format!("*Created: {}*\n", note.created_at.format("%Y-%m-%d %H:%M:%S")));
        markdown.push_str(&format!("*Updated: {}*\n\n", note.updated_at.format("%Y-%m-%d %H:%M:%S")));
        
        // Parse tags from JSON
        if let Ok(tags) = serde_json::from_str::<Vec<String>>(&note.tags) {
            if !tags.is_empty() {
                markdown.push_str(&format!("*Tags: {}*\n\n", tags.join(", ")));
            }
        }
        
        markdown.push_str(&note.content);
        markdown.push_str("\n\n---\n\n");
    }
    
    Ok(markdown)
}

fn export_as_json(notes: Vec<Note>) -> Result<String, String> {
    serde_json::to_string_pretty(&notes)
        .map_err(|e| format!("Failed to serialize notes to JSON: {}", e))
}

#[tauri::command]
async fn import_notes(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<Vec<Note>, String> {
    use std::fs;
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Try to parse as JSON first
    if let Ok(notes) = serde_json::from_str::<Vec<Note>>(&content) {
        return import_json_notes(notes, state).await;
    }
    
    // Otherwise, treat as markdown
    import_markdown_content(content, state).await
}

async fn import_json_notes(
    notes: Vec<Note>,
    state: State<'_, AppState>,
) -> Result<Vec<Note>, String> {
    let pool = state.db.pool();
    let mut imported_notes = Vec::new();
    
    for note in notes {
        let new_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        
        let imported_note = sqlx::query_as::<_, Note>(
            r#"
            INSERT INTO notes (id, title, content, collection_id, tags, created_at, updated_at, word_count, character_count, is_archived)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            RETURNING *
            "#,
        )
        .bind(&new_id)
        .bind(&note.title)
        .bind(&note.content)
        .bind(&note.collection_id)
        .bind(&note.tags)
        .bind(&now)
        .bind(&now)
        .bind(count_words(&note.content))
        .bind(count_characters(&note.content))
        .bind(false)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to import note: {}", e))?;
        
        imported_notes.push(imported_note);
    }
    
    Ok(imported_notes)
}

async fn import_markdown_content(
    content: String,
    state: State<'_, AppState>,
) -> Result<Vec<Note>, String> {
    let pool = state.db.pool();
    let mut imported_notes = Vec::new();
    
    // Simple markdown parsing - split by horizontal rules
    let sections: Vec<&str> = content.split("\n---\n").collect();
    
    for (i, section) in sections.iter().enumerate() {
        if section.trim().is_empty() {
            continue;
        }
        
        let lines: Vec<&str> = section.lines().collect();
        let title = if let Some(first_line) = lines.first() {
            first_line.trim_start_matches('#').trim().to_string()
        } else {
            format!("Imported Note {}", i + 1)
        };
        
        let content = section.to_string();
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let tags = "[]";
        
        let imported_note = sqlx::query_as::<_, Note>(
            r#"
            INSERT INTO notes (id, title, content, collection_id, tags, created_at, updated_at, word_count, character_count, is_archived)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            RETURNING *
            "#,
        )
        .bind(&id)
        .bind(&title)
        .bind(&content)
        .bind::<Option<String>>(None)
        .bind(tags)
        .bind(&now)
        .bind(&now)
        .bind(count_words(&content))
        .bind(count_characters(&content))
        .bind(false)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to import markdown note: {}", e))?;
        
        imported_notes.push(imported_note);
    }
    
    Ok(imported_notes)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_storage_info(state: State<'_, AppState>, app_handle: AppHandle) -> Result<StorageInfo, String> {
    let pool = state.db.pool();
    
    let notes_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM notes")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to count notes: {}", e))?;
    
    let collections_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM collections")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Failed to count collections: {}", e))?;
    
    // Get database file size
    let db_size = get_database_size(&app_handle).unwrap_or(0);
    
    Ok(StorageInfo {
        total_notes: notes_count.0 as u32,
        total_collections: collections_count.0 as u32,
        database_size: db_size,
        last_backup: None,
    })
}

fn get_database_size(app_handle: &AppHandle) -> Result<u64, Box<dyn std::error::Error>> {
    use std::fs;
    
    let app_dir = app_handle.path().app_data_dir()?;
    let database_path = app_dir.join("notura.db");
    
    if database_path.exists() {
        let metadata = fs::metadata(database_path)?;
        Ok(metadata.len())
    } else {
        Ok(0)
    }
}

// Image management commands
#[tauri::command]
async fn save_image(
    file_data: Vec<u8>,
    filename: String,
    original_name: String,
    mime_type: String,
    note_id: Option<String>,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<ImageMetadata, String> {
    use std::fs;
    use std::path::Path;
    
    let pool = state.db.pool();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    // Create images directory if it doesn't exist
    let app_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let images_dir = app_dir.join("images");
    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("Failed to create images directory: {}", e))?;
    
    // Generate unique filename
    let extension = Path::new(&original_name)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("png");
    let unique_filename = format!("{}_{}.{}", id, chrono::Utc::now().timestamp(), extension);
    let file_path = images_dir.join(&unique_filename);
    
    // Save file to disk
    fs::write(&file_path, &file_data)
        .map_err(|e| format!("Failed to save image file: {}", e))?;
    
    // Save metadata to database
    let image_metadata = sqlx::query_as::<_, ImageMetadata>(
        r#"
        INSERT INTO images (id, filename, original_name, file_path, size, mime_type, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&unique_filename)
    .bind(&original_name)
    .bind(file_path.to_string_lossy().to_string())
    .bind(file_data.len() as i64)
    .bind(&mime_type)
    .bind(&now)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to save image metadata: {}", e))?;
    
    // If note_id is provided, create the association
    if let Some(note_id) = note_id {
        sqlx::query(
            "INSERT INTO note_images (note_id, image_id, created_at) VALUES (?1, ?2, ?3)"
        )
        .bind(&note_id)
        .bind(&id)
        .bind(&now)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to associate image with note: {}", e))?;
    }
    
    Ok(image_metadata)
}

#[tauri::command]
async fn get_image(
    id: String,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<ImageWithData, String> {
    use std::fs;
    
    let pool = state.db.pool();
    
    let image_metadata = sqlx::query_as::<_, ImageMetadata>(
        "SELECT * FROM images WHERE id = ?1"
    )
    .bind(&id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get image metadata: {}", e))?;
    
    // Read file data
    let file_data = fs::read(&image_metadata.file_path)
        .map_err(|e| format!("Failed to read image file: {}", e))?;
    
    // Convert to base64 for frontend
    let base64_data = base64::encode(&file_data);
    let data_url = format!("data:{};base64,{}", image_metadata.mime_type, base64_data);
    
    Ok(ImageWithData {
        id: image_metadata.id,
        filename: image_metadata.filename,
        original_name: image_metadata.original_name,
        file_path: image_metadata.file_path,
        size: image_metadata.size,
        mime_type: image_metadata.mime_type,
        created_at: image_metadata.created_at,
        data_url,
    })
}

#[tauri::command]
async fn get_all_images(state: State<'_, AppState>) -> Result<Vec<ImageMetadata>, String> {
    let pool = state.db.pool();
    
    let images = sqlx::query_as::<_, ImageMetadata>(
        "SELECT * FROM images ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get images: {}", e))?;
    
    Ok(images)
}

#[tauri::command]
async fn get_images_for_note(
    note_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<ImageMetadata>, String> {
    let pool = state.db.pool();
    
    let images = sqlx::query_as::<_, ImageMetadata>(
        r#"
        SELECT i.* FROM images i
        JOIN note_images ni ON i.id = ni.image_id
        WHERE ni.note_id = ?1
        ORDER BY i.created_at DESC
        "#
    )
    .bind(&note_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get images for note: {}", e))?;
    
    Ok(images)
}

#[tauri::command]
async fn delete_image(
    id: String,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    use std::fs;
    
    let pool = state.db.pool();
    
    // Get image metadata first
    let image_metadata = sqlx::query_as::<_, ImageMetadata>(
        "SELECT * FROM images WHERE id = ?1"
    )
    .bind(&id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get image metadata: {}", e))?;
    
    // Delete file from disk
    if let Err(e) = fs::remove_file(&image_metadata.file_path) {
        eprintln!("Warning: Failed to delete image file {}: {}", image_metadata.file_path, e);
    }
    
    // Delete from database (this will cascade to note_images due to foreign key)
    let result = sqlx::query("DELETE FROM images WHERE id = ?1")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete image from database: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Image with id {} not found", id));
    }
    
    Ok(())
}

#[tauri::command]
async fn update_image_note_association(
    image_id: String,
    note_id: String,
    is_used: bool,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let pool = state.db.pool();
    let now = Utc::now();
    
    if is_used {
        // Add association if it doesn't exist
        sqlx::query(
            r#"
            INSERT INTO note_images (note_id, image_id, created_at)
            VALUES (?1, ?2, ?3)
            ON CONFLICT (note_id, image_id) DO NOTHING
            "#
        )
        .bind(&note_id)
        .bind(&image_id)
        .bind(&now)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to add image association: {}", e))?;
    } else {
        // Remove association
        sqlx::query("DELETE FROM note_images WHERE note_id = ?1 AND image_id = ?2")
            .bind(&note_id)
            .bind(&image_id)
            .execute(pool)
            .await
            .map_err(|e| format!("Failed to remove image association: {}", e))?;
    }
    
    Ok(())
}

// Data models
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ImageMetadata {
    pub id: String,
    pub filename: String,
    pub original_name: String,
    pub file_path: String,
    pub size: i64,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageWithData {
    pub id: String,
    pub filename: String,
    pub original_name: String,
    pub file_path: String,
    pub size: i64,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
    pub data_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub collection_id: Option<String>,
    pub tags: String, // JSON string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub word_count: i32,
    pub character_count: i32,
    pub is_archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub parent_id: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub note_id: String,
    pub title: String,
    pub excerpt: String,
    pub highlights: Vec<String>,
    pub relevance_score: f64,
    pub last_modified: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchFilters {
    pub collections: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub date_range: Option<DateRange>,
    pub content_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DateRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

#[derive(serde::Serialize)]
struct StorageInfo {
    total_notes: u32,
    total_collections: u32,
    database_size: u64,
    last_backup: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                match Database::new(&app_handle).await {
                    Ok(db) => {
                        let state = AppState {
                            db: Arc::new(db),
                        };
                        app_handle.manage(state);
                        println!("Database initialized successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                        std::process::exit(1);
                    }
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_storage_info,
            create_note,
            update_note,
            delete_note,
            get_note,
            get_all_notes,
            create_collection,
            update_collection,
            delete_collection,
            get_collection,
            get_all_collections,
            move_note_to_collection,
            search_notes,
            get_recent_searches,
            save_recent_search,
            export_notes,
            import_notes,
            save_image,
            get_image,
            get_all_images,
            get_images_for_note,
            delete_image,
            update_image_note_association
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


