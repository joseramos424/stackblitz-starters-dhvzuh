from todos.app.database import TaskDatabase

def mostrar_menu():
    print("\n=== Gestor de Tareas ===")
    print("1. Agregar tarea")
    print("2. Ver todas las tareas")
    print("3. Actualizar tarea")
    print("4. Eliminar tarea")
    print("5. Salir")
    return input("Seleccione una opción: ")

def agregar_tarea(db):
    titulo = input("Título de la tarea: ")
    descripcion = input("Descripción (opcional): ")
    fecha_limite = input("Fecha límite (YYYY-MM-DD) (opcional): ")
    prioridad = input("Prioridad (alta/media/baja): ").lower()
    
    if not fecha_limite:
        fecha_limite = None
    if not prioridad:
        prioridad = 'media'
    
    task_id = db.add_task(titulo, descripcion, fecha_limite, prioridad)
    print(f"Tarea agregada con ID: {task_id}")

def ver_tareas(db):
    tareas = db.get_all_tasks()
    if not tareas:
        print("No hay tareas registradas.")
        return
    
    print("\n=== Tareas ===")
    for tarea in tareas:
        print(f"\nID: {tarea[0]}")
        print(f"Título: {tarea[1]}")
        print(f"Descripción: {tarea[2]}")
        print(f"Estado: {tarea[3]}")
        print(f"Creada: {tarea[4]}")
        print(f"Actualizada: {tarea[5]}")
        print(f"Fecha límite: {tarea[6]}")
        print(f"Prioridad: {tarea[7]}")
        print("-" * 30)

def actualizar_tarea(db):
    task_id = input("ID de la tarea a actualizar: ")
    print("\n¿Qué desea actualizar?")
    print("1. Estado")
    print("2. Descripción")
    print("3. Fecha límite")
    print("4. Prioridad")
    opcion = input("Seleccione una opción: ")
    
    actualizaciones = {}
    if opcion == "1":
        estado = input("Nuevo estado (pendiente/en_progreso/completada): ")
        actualizaciones['status'] = estado
    elif opcion == "2":
        descripcion = input("Nueva descripción: ")
        actualizaciones['description'] = descripcion
    elif opcion == "3":
        fecha = input("Nueva fecha límite (YYYY-MM-DD): ")
        actualizaciones['due_date'] = fecha
    elif opcion == "4":
        prioridad = input("Nueva prioridad (alta/media/baja): ")
        actualizaciones['priority'] = prioridad
    
    db.update_task(task_id, **actualizaciones)
    print("Tarea actualizada con éxito")

def eliminar_tarea(db):
    task_id = input("ID de la tarea a eliminar: ")
    db.delete_task(task_id)
    print("Tarea eliminada con éxito")

def main():
    db = TaskDatabase()
    
    while True:
        opcion = mostrar_menu()
        
        if opcion == "1":
            agregar_tarea(db)
        elif opcion == "2":
            ver_tareas(db)
        elif opcion == "3":
            actualizar_tarea(db)
        elif opcion == "4":
            eliminar_tarea(db)
        elif opcion == "5":
            print("¡Hasta luego!")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

if __name__ == "__main__":
    main()
