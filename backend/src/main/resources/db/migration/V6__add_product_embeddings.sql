-- V6: embeddings semánticos para el catálogo de productos.
-- El modelo gemini-embedding-2 se configura a 768 dimensiones en EmbeddingService.
ALTER TABLE productos ADD COLUMN IF NOT EXISTS embedding vector(768);

-- El índice acelera la búsqueda de vecinos para los productos visibles en el catálogo.
CREATE INDEX IF NOT EXISTS idx_productos_embedding_hnsw_activos
    ON productos USING hnsw (embedding vector_cosine_ops)
    WHERE estado = 'ACTIVO' AND embedding IS NOT NULL;
