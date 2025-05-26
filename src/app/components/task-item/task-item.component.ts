import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskInvitation } from '../../shared/model/task';
import { TaskService } from '../../services/task.service';
import { DocumentReference } from '@angular/fire/firestore';

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
  task: TaskInvitation = {
    title: '',
    description: '',
    invitation: []
  };

  constructor(private taskService: TaskService) {}

  invitationString: string = '';

  saveTask() {
    if (!this.createdByUserId) {
      console.error('User ID is missing, cannot save task.');
      return;
    }
    const taskToSave = {
        title: this.task.title,
        description: this.task.description,
        invitation: this.invitationString.split(',').map(email => email.trim()).filter(email => email !== ''),
        createdBy: this.createdByUserId
    };

  this.taskService.addTask(this.createdByUserId, taskToSave).then((docRef: DocumentReference) => {
    const newTaskWithId: Task = {
            ...taskToSave,
            id: docRef.id,
            createdBy: this.createdByUserId, 
            isSharedCopy: false,
            originalCreatorId: this.createdByUserId
        };
        this.taskCreated.emit(newTaskWithId);
        this.onClose();
    }).catch(err => {
      console.error('Error creating task:', err);
    });
  }

  onClose() {
    this.close.emit();
  }
}
