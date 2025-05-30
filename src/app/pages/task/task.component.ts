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
  currentUserEmail: string | null = null;
  isModalOpen = false;
  editingTask: Task | null = null;
  private authSubscription: Subscription | null = null;
  private tasksSubscription: Subscription | null = null;

  constructor(private taskService: TaskService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.onAuthStateChanged().subscribe((user: User | null) => { 
      this.currentUserEmail = user ? user.email : null;
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
      this.tasksSubscription.unsubscribe();
    }
    this.tasksSubscription = this.taskService.getTasks(userId).subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  openCreateTaskModal() {
    if (this.currentUserId) {
      this.editingTask = null;
      this.isModalOpen = true;
    } else {
      console.error("No user logged in to create a task.");
    }
  }

  openEditTaskModal(task: Task) {
    if (this.currentUserId) {
      this.editingTask = { ...task }; // Clonar la tarea para evitar mutaciones directas
      this.isModalOpen = true;
    } else {
      console.error("No user logged in to edit a task.");
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingTask = null; // Limpiar la tarea en edición al cerrar
  }

  onTaskCreated(newTask: Task) {
    this.closeModal();
  }

  onTaskUpdated(updatedTask: Task) {
    this.closeModal();
  }

  deleteTask(taskId: string) {
    if (this.currentUserId && taskId) {
      this.taskService.deleteTask(this.currentUserId, taskId)
        .then(() => console.log('Task deleted'))
        .catch(err => console.error('Error deleting task', err));
    }
  }

  markTaskAsCompleted(task: Task) {
    if (this.currentUserId && task.id) {
      this.taskService.updateTaskCompletionStatus(this.currentUserId, task.id, true)
        .then(() => console.log('Task marked as completed'))
        .catch(err => console.error('Error marking task as completed', err));
    }
  }

  markTaskAsIncomplete(task: Task) {
    if (this.currentUserId && task.id) {
      this.taskService.updateTaskCompletionStatus(this.currentUserId, task.id, false)
        .then(() => console.log('Task marked as incomplete'))
        .catch(err => console.error('Error marking task as incomplete', err));
    }
  }
}