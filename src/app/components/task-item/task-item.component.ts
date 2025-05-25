import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../shared/model/task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  @Input() createdByUserId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Task>();
  task: Task = {
    createdBy: '', // You'll likely need to set this based on the logged-in user
    title: '',
    description: '',
    invitation: [],
  };

  constructor(private taskService: TaskService) {}

  invitationString: string = '';

  saveTask() {
    this.task.invitation = this.invitationString.split(',').map(email => email.trim()).filter(email => email !== '');
    this.task.createdBy = this.createdByUserId;
    this.taskService.addTask(this.task).then(() => {
        this.taskCreated.emit(this.task);
        this.onClose();
    }).catch(err => {
      console.error('Error creating task:', err);
    });
  }

  onClose() {
    this.close.emit();
  }
}
