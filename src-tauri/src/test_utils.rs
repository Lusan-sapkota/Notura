#[cfg(test)]
pub mod test_utils {
    use crate::database::DatabaseResult;
    use sqlx::SqlitePool;
    use tempfile::NamedTempFile;

    pub async fn create_test_database() -> DatabaseResult<SqlitePool> {
        let temp_file = NamedTempFile::new()
            .map_err(|e| crate::database::DatabaseError::Connection(sqlx::Error::Io(e)))?;
        
        let database_url = format!("sqlite:{}", temp_file.path().display());
        let pool = SqlitePool::connect(&database_url).await?;
        
        // Run migrations
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
    
    pub async fn cleanup_test_database(pool: SqlitePool) {
        pool.close().await;
    }
}