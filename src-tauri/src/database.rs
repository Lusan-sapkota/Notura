use sqlx::{Pool, Sqlite, SqlitePool, sqlite::SqliteConnectOptions};
use std::str::FromStr;

use tauri::{AppHandle, Manager};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Database connection error: {0}")]
    Connection(#[from] sqlx::Error),
    #[error("Migration error: {0}")]
    Migration(String),
    #[error("Query error: {0}")]
    Query(String),
}

pub type DatabaseResult<T> = Result<T, DatabaseError>;

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(app_handle: &AppHandle) -> DatabaseResult<Self> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| DatabaseError::Connection(sqlx::Error::Configuration(e.into())))?;
        
        println!("App data directory: {:?}", app_dir);
        
        std::fs::create_dir_all(&app_dir)
            .map_err(|e| {
                println!("Failed to create app directory: {}", e);
                DatabaseError::Connection(sqlx::Error::Io(e))
            })?;
        
        let database_path = app_dir.join("notura.db");
        println!("Database path: {:?}", database_path);
        
        // Use connection options to ensure the database file is created properly
        let connection_options = SqliteConnectOptions::from_str(&format!("sqlite:{}", database_path.display()))?
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
            .synchronous(sqlx::sqlite::SqliteSynchronous::Normal);
        
        let pool = SqlitePool::connect_with(connection_options).await
            .map_err(|e| {
                println!("Failed to connect to database: {}", e);
                DatabaseError::Connection(e)
            })?;
        
        let db = Database { pool };
        db.run_migrations().await?;
        
        println!("Database initialized successfully");
        Ok(db)
    }
    
    pub fn pool(&self) -> &Pool<Sqlite> {
        &self.pool
    }
    
    async fn run_migrations(&self) -> DatabaseResult<()> {
        // Create notes table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                collection_id TEXT,
                tags TEXT, -- JSON array
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                word_count INTEGER DEFAULT 0,
                character_count INTEGER DEFAULT 0,
                is_archived BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (collection_id) REFERENCES collections(id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        // Create collections table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS collections (
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
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        // Create FTS5 virtual table for full-text search
        sqlx::query(
            r#"
            CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                title, content, tags,
                content='notes',
                content_rowid='rowid'
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        // Create triggers to keep FTS table in sync
        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(rowid, title, content, tags) 
                VALUES (new.rowid, new.title, new.content, new.tags);
            END
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, content, tags) 
                VALUES('delete', old.rowid, old.title, old.content, old.tags);
            END
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, content, tags) 
                VALUES('delete', old.rowid, old.title, old.content, old.tags);
                INSERT INTO notes_fts(rowid, title, content, tags) 
                VALUES (new.rowid, new.title, new.content, new.tags);
            END
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        // Create images table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS images (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                size INTEGER NOT NULL,
                mime_type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        // Create note_images junction table for many-to-many relationship
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS note_images (
                note_id TEXT NOT NULL,
                image_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (note_id, image_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| DatabaseError::Migration(e.to_string()))?;
        
        Ok(())
    }
}