import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../shared/model/task';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  currentUserId: string | null = null;
  isModalOpen = false;
  private authSubscription: Subscription | null = null;
  private tasksSubscription: Subscription | null = null;

  constructor(private taskService: TaskService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.onAuthStateChanged().subscribe((user: User | null) => { 
      this.currentUserId = user ? user.uid : null;
      if (this.currentUserId) {
        this.loadTasks(this.currentUserId);
      } else {
        this.tasks = [];
        if (this.tasksSubscription) {
          this.tasksSubscription.unsubscribe();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  loadTasks(userId: string) {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe(); // Cancelar suscripción anterior si existe
    }
    this.tasksSubscription = this.taskService.getTasks(userId).subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  openCreateTaskModal() {
    if (this.currentUserId) { // Solo abrir si hay un usuario
        this.isModalOpen = true;
    } else {
        console.error("No user logged in to create a task.");
        // Podrías mostrar un mensaje al usuario
    }
  }

  closeCreateTaskModal() {
    this.isModalOpen = false;
    // No es necesario llamar a loadTasks aquí si onTaskCreated lo hace,
    // o si la lista se actualiza en tiempo real por la suscripción.
  }

  onTaskCreated(newTask: Task) {
    // La lista se actualiza a través de la suscripción en loadTasks.
    // Si no usaras una suscripción en tiempo real, aquí añadirías la tarea a this.tasks.
    // this.tasks.push(newTask); // Ejemplo si no fuera en tiempo real
    // O si loadTasks no se llama automáticamente por la suscripción:
    if (this.currentUserId) {
        // this.loadTasks(this.currentUserId); // Opcional, si la suscripción no lo cubre
    }
    this.isModalOpen = false; // Asegúrate de cerrar el modal
  }

  updateTask(task: Task) {
    if (this.currentUserId && task.id) {
      this.taskService.updateTask(this.currentUserId, task)
        .then(() => console.log('Task updated'))
        .catch(err => console.error('Error updating task', err));
    }
  }

  deleteTask(taskId: string) {
    if (this.currentUserId) {
      this.taskService.deleteTask(this.currentUserId, taskId)
        .then(() => console.log('Task deleted'))
        .catch(err => console.error('Error deleting task', err));
    }
  }
}