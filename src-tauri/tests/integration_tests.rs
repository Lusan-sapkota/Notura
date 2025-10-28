use sqlx::SqlitePool;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub collection_id: Option<String>,
    pub tags: String,
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

async fn create_test_database() -> Result<SqlitePool, sqlx::Error> {
    let database_url = "sqlite::memory:".to_string();
    let pool = SqlitePool::connect(&database_url).await?;
    
    // Create tables
    sqlx::query(
        r#"
        CREATE TABLE notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            collection_id TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            word_count INTEGER DEFAULT 0,
            character_count INTEGER DEFAULT 0,
            is_archived BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (collection_id) REFERENCES collections(id)
        )
        "#,
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE collections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            parent_id TEXT,
            color TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES collections(id)
        )
        "#,
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE VIRTUAL TABLE notes_fts USING fts5(
            title, content, tags,
            content='notes',
            content_rowid='rowid'
        )
        "#,
    )
    .execute(&pool)
    .await?;
    
    Ok(pool)
}

fn count_words(text: &str) -> i32 {
    text.split_whitespace().count() as i32
}

fn count_characters(text: &str) -> i32 {
    text.chars().count() as i32
}

fn sanitize_content(content: &str) -> String {
    content.replace('\0', "").replace("\r\n", "\n").replace('\r', "\n")
}

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
    
    pool.close().await;
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
    
    pool.close().await;
}

#[tokio::test]
async fn test_word_and_character_counting() {
    let pool = create_test_database().await.unwrap();
    
    // Test with markdown content
    let markdown_content = r#"# Heading

This is a **bold** text with `code` and [link](http://example.com).

- List item 1
- List item 2

```rust
fn hello() {
    println!("Hello, world!");
}
```"#;
    
    let note = create_note_internal(&pool, "Markdown Test".to_string(), markdown_content.to_string(), None).await.unwrap();
    
    // Should count all words including markdown syntax
    assert!(note.word_count > 0);
    assert!(note.character_count > 0);
    assert_eq!(note.character_count, markdown_content.chars().count() as i32);
    
    pool.close().await;
}

#[tokio::test]
async fn test_content_sanitization() {
    let pool = create_test_database().await.unwrap();
    
    // Test with content that needs sanitization
    let dirty_content = "Line 1\r\nLine 2\rLine 3\nLine 4\0Null byte";
    let expected_clean = "Line 1\nLine 2\nLine 3\nLine 4Null byte";
    
    let note = create_note_internal(&pool, "Sanitization Test".to_string(), dirty_content.to_string(), None).await.unwrap();
    
    assert_eq!(note.content, expected_clean);
    
    pool.close().await;
}

#[tokio::test]
async fn test_export_functionality() {
    let pool = create_test_database().await.unwrap();
    
    // Create test notes
    let note1 = create_note_internal(&pool, "Note 1".to_string(), "Content of note 1".to_string(), None).await.unwrap();
    let note2 = create_note_internal(&pool, "Note 2".to_string(), "Content of note 2".to_string(), None).await.unwrap();
    
    // Test markdown export
    let notes = vec![note1, note2];
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
    
    assert!(markdown.contains("# Note 1"));
    assert!(markdown.contains("# Note 2"));
    assert!(markdown.contains("Content of note 1"));
    assert!(markdown.contains("Content of note 2"));
    
    pool.close().await;
}