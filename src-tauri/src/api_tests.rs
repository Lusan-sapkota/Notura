#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::test_utils::{create_test_database, cleanup_test_database};
    use sqlx::SqlitePool;
    use chrono::{DateTime, Utc};
    use uuid::Uuid;
    use serde::{Deserialize, Serialize};
    
    // Re-define the structs for testing
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
    
    // Utility functions
    fn count_words(text: &str) -> i32 {
        text.split_whitespace().count() as i32
    }

    fn count_characters(text: &str) -> i32 {
        text.chars().count() as i32
    }

    fn sanitize_content(content: &str) -> String {
        content.replace('\0', "").replace("\r\n", "\n").replace('\r', "\n")
    }

    fn extract_highlights(content: &str, query: &str) -> Vec<String> {
        let query_terms: Vec<&str> = query.split_whitespace().collect();
        let mut highlights = Vec::new();
        
        for term in query_terms {
            if content.to_lowercase().contains(&term.to_lowercase()) {
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

    fn export_as_markdown(notes: Vec<Note>) -> Result<String, String> {
        let mut markdown = String::new();
        
        for note in notes {
            markdown.push_str(&format!("# {}\n\n", note.title));
            markdown.push_str(&format!("*Created: {}*\n", note.created_at.format("%Y-%m-%d %H:%M:%S")));
            markdown.push_str(&format!("*Updated: {}*\n\n", note.updated_at.format("%Y-%m-%d %H:%M:%S")));
            
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
    
    #[tokio::test]
    async fn test_create_note() {
        let pool = create_test_database().await.unwrap();
        
        let title = "Test Note".to_string();
        let content = "This is a test note with some content.".to_string();
        let collection_id = None;
        
        let note = create_note_internal(&pool, title.clone(), content.clone(), collection_id).await.unwrap();
        
        assert_eq!(note.title, title);
        assert_eq!(note.content, content);
        assert_eq!(note.word_count, 8);
        assert_eq!(note.character_count, 38);
        assert!(!note.is_archived);
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_update_note() {
        let pool = create_test_database().await.unwrap();
        
        let note = create_note_internal(&pool, "Original Title".to_string(), "Original content".to_string(), None).await.unwrap();
        
        let new_content = "Updated content with more words".to_string();
        let updated_note = update_note_internal(&pool, note.id, new_content.clone()).await.unwrap();
        
        assert_eq!(updated_note.content, new_content);
        assert_eq!(updated_note.word_count, 5);
        assert_eq!(updated_note.character_count, 31);
        assert!(updated_note.updated_at > note.updated_at);
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_delete_note() {
        let pool = create_test_database().await.unwrap();
        
        let note = create_note_internal(&pool, "Test Note".to_string(), "Test content".to_string(), None).await.unwrap();
        
        let result = delete_note_internal(&pool, note.id.clone()).await;
        assert!(result.is_ok());
        
        let get_result = get_note_internal(&pool, note.id).await;
        assert!(get_result.is_err());
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_create_collection() {
        let pool = create_test_database().await.unwrap();
        
        let name = "Test Collection".to_string();
        let description = Some("A test collection".to_string());
        let parent_id = None;
        
        let collection = create_collection_internal(&pool, name.clone(), description.clone(), parent_id).await.unwrap();
        
        assert_eq!(collection.name, name);
        assert_eq!(collection.description, description);
        assert_eq!(collection.parent_id, None);
        assert_eq!(collection.sort_order, 1);
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_hierarchical_collections() {
        let pool = create_test_database().await.unwrap();
        
        let parent = create_collection_internal(&pool, "Parent".to_string(), None, None).await.unwrap();
        let child = create_collection_internal(&pool, "Child".to_string(), None, Some(parent.id.clone())).await.unwrap();
        
        assert_eq!(child.parent_id, Some(parent.id));
        assert_eq!(child.sort_order, 1);
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_search_notes() {
        let pool = create_test_database().await.unwrap();
        
        let _note1 = create_note_internal(&pool, "Rust Programming".to_string(), "Rust is a systems programming language".to_string(), None).await.unwrap();
        let _note2 = create_note_internal(&pool, "JavaScript Guide".to_string(), "JavaScript is a web programming language".to_string(), None).await.unwrap();
        let _note3 = create_note_internal(&pool, "Python Tutorial".to_string(), "Python is great for data science".to_string(), None).await.unwrap();
        
        let results = search_notes_internal(&pool, "programming".to_string(), None).await.unwrap();
        
        assert_eq!(results.len(), 2);
        assert!(results.iter().any(|r| r.title.contains("Rust")));
        assert!(results.iter().any(|r| r.title.contains("JavaScript")));
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_export_notes_markdown() {
        let pool = create_test_database().await.unwrap();
        
        let note1 = create_note_internal(&pool, "Note 1".to_string(), "Content of note 1".to_string(), None).await.unwrap();
        let note2 = create_note_internal(&pool, "Note 2".to_string(), "Content of note 2".to_string(), None).await.unwrap();
        
        let note_ids = vec![note1.id, note2.id];
        let markdown = export_notes_internal(&pool, "markdown".to_string(), note_ids).await.unwrap();
        
        assert!(markdown.contains("# Note 1"));
        assert!(markdown.contains("# Note 2"));
        assert!(markdown.contains("Content of note 1"));
        assert!(markdown.contains("Content of note 2"));
        
        cleanup_test_database(pool).await;
    }
    
    #[tokio::test]
    async fn test_move_note_to_collection() {
        let pool = create_test_database().await.unwrap();
        
        let collection = create_collection_internal(&pool, "Test Collection".to_string(), None, None).await.unwrap();
        let note = create_note_internal(&pool, "Test Note".to_string(), "Test content".to_string(), None).await.unwrap();
        
        let result = move_note_to_collection_internal(&pool, note.id.clone(), Some(collection.id.clone())).await;
        assert!(result.is_ok());
        
        let updated_note = get_note_internal(&pool, note.id).await.unwrap();
        assert_eq!(updated_note.collection_id, Some(collection.id));
        
        cleanup_test_database(pool).await;
    }
    
    // Internal functions for testing
    async fn create_note_internal(
        pool: &SqlitePool,
        title: String,
        content: String,
        collection_id: Option<String>,
    ) -> Result<Note, String> {
        let id = Uuid::new_v4().to_string();
        let sanitized_content = sanitize_content(&content);
        let word_count = count_words(&sanitized_content);
        let character_count = count_characters(&sanitized_content);
        let now = Utc::now();
        let tags = "[]";
        
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
    
    async fn update_note_internal(
        pool: &SqlitePool,
        id: String,
        content: String,
    ) -> Result<Note, String> {
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
    
    async fn delete_note_internal(pool: &SqlitePool, id: String) -> Result<(), String> {
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
    
    async fn get_note_internal(pool: &SqlitePool, id: String) -> Result<Note, String> {
        let note = sqlx::query_as::<_, Note>("SELECT * FROM notes WHERE id = ?1")
            .bind(&id)
            .fetch_one(pool)
            .await
            .map_err(|e| format!("Failed to get note: {}", e))?;
        
        Ok(note)
    }
    
    async fn create_collection_internal(
        pool: &SqlitePool,
        name: String,
        description: Option<String>,
        parent_id: Option<String>,
    ) -> Result<Collection, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        
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
    
    async fn search_notes_internal(
        pool: &SqlitePool,
        query: String,
        _filters: Option<SearchFilters>,
    ) -> Result<Vec<SearchResult>, String> {
        if query.trim().is_empty() {
            return Ok(vec![]);
        }
        
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
    
    async fn export_notes_internal(
        pool: &SqlitePool,
        format: String,
        note_ids: Vec<String>,
    ) -> Result<String, String> {
        if note_ids.is_empty() {
            return Err("No notes selected for export".to_string());
        }
        
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
    
    async fn move_note_to_collection_internal(
        pool: &SqlitePool,
        note_id: String,
        collection_id: Option<String>,
    ) -> Result<(), String> {
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
}