import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../shared/model/task';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {
  tasks: Task[] = [];
  currentUserId: string | null = null;
  isModalOpen = false;
  private authSubscription: Subscription | null = null;

  constructor(private taskService: TaskService, private authService: AuthService) {
    this.authSubscription = this.authService.onAuthStateChanged().subscribe(user => { // Subscribe to onAuthStateChanged
      this.currentUserId = user ? (user as any).uid : null;
      if (this.currentUserId) {
        this.loadTasks();
      } else {
        this.tasks = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  openCreateTaskModal() {
    this.isModalOpen = true;
  }

  closeCreateTaskModal() {
    this.isModalOpen = false;
    this.loadTasks(); // Refresh tasks after closing modal
  }

  onTaskCreated(newTask: Task) {
    // Task is already added by the modal, just refresh the list
    this.loadTasks();
  }

  // Placeholder for update and delete methods
  updateTask(task: Task) {
    // Implement update logic
  }

  deleteTask(taskId: string) {
    // Implement delete logic
  }
}
