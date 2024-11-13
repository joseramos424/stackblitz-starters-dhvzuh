import sqlite3
import os
from datetime import datetime

class TaskDatabase:
    def __init__(self):
        # Asegurar que el directorio data existe
        self.db_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        os.makedirs(self.db_dir, exist_ok=True)
        
        # Ruta completa de la base de datos
        self.db_path = os.path.join(self.db_dir, "tasks.db")
        
        # Crear la conexión y las tablas
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()

    def agregar_tarea(self, titulo, descripcion):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO tasks (title, description) VALUES (?, ?)',
                (titulo, descripcion)
            )
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error al agregar tarea: {e}")
            return False

    def obtener_tareas(self):
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT * FROM tasks')
            return cursor.fetchall()
        except Exception as e:
            print(f"Error al obtener tareas: {e}")
            return []

    def actualizar_tarea(self, id_tarea, titulo, descripcion):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
                (titulo, descripcion, id_tarea)
            )
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error al actualizar tarea: {e}")
            return False

    def eliminar_tarea(self, id_tarea):
        cursor = self.conn.cursor()
        try:
            cursor.execute('DELETE FROM tasks WHERE id = ?', (id_tarea,))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error al eliminar tarea: {e}")
            return False

    def __del__(self):
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()
