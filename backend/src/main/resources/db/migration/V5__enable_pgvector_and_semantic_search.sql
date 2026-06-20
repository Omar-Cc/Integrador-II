-- V5__enable_pgvector_and_semantic_search.sql
-- Habilita pgvector y agrega columnas de vectores para búsqueda semántica en RAG.

-- 1. Habilitar la extensión vector en PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Agregar columna de embeddings de 768 dimensiones (para Gemini text-embedding-004)
-- a la tabla documentos_conocimiento
ALTER TABLE documentos_conocimiento ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Agregar columna de embeddings de 768 dimensiones a la tabla faq_chatbot
ALTER TABLE faq_chatbot ADD COLUMN IF NOT EXISTS embedding vector(768);
