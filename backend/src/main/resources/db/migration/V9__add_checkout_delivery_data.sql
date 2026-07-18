ALTER TABLE pedidos
    ADD COLUMN modalidad_entrega VARCHAR(20) NOT NULL DEFAULT 'TIENDA',
    ADD COLUMN direccion_entrega TEXT,
    ADD COLUMN distrito_entrega VARCHAR(120),
    ADD COLUMN nombre_receptor VARCHAR(160),
    ADD COLUMN telefono_receptor VARCHAR(40),
    ADD COLUMN correo_contacto VARCHAR(320) NOT NULL DEFAULT '';

ALTER TABLE pedidos
    ADD CONSTRAINT chk_pedidos_modalidad_entrega
        CHECK (modalidad_entrega IN ('TIENDA', 'DOMICILIO'));
