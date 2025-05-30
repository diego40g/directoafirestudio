import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class TaskItemComponent implements OnInit, OnChanges {
  @Input() createdByUserId!: string;
  @Input() taskToEdit?: Task | null = null; 
  @Output() close = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Task>();
  @Output() taskUpdated = new EventEmitter<Task>();

  task: TaskInvitation = {
    title: '',
    description: '',
    invitation: []
  };

  invitationString: string = '';
  isEditMode = false;
  modalTitle = 'Create New Task';
  saveButtonText = 'Save Task';
  
  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.setupComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskToEdit']) {
      this.setupComponent();
    }
  }

  private setupComponent(): void {
    if (this.taskToEdit && this.taskToEdit.id) {
      this.isEditMode = true;
      this.modalTitle = 'Edit Task';
      this.saveButtonText = 'Update Task';
      this.task = {
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        invitation: this.taskToEdit.invitation || []
      };
      this.invitationString = (this.taskToEdit.invitation || []).join(', ');
    } else {
      this.isEditMode = false;
      this.modalTitle = 'Create New Task';
      this.saveButtonText = 'Save Task';
      this.task = { title: '', description: '', invitation: [] };
      this.invitationString = '';
    }
  }

  saveTask() {
    if (!this.createdByUserId) {
      console.error('User ID is missing, cannot save task.');
      return;
    }

    const processedInvitations = this.invitationString.split(',').map(email => email.trim()).filter(email => email !== '');

    if (this.isEditMode && this.taskToEdit && this.taskToEdit.id) {
      // Modo Edición
      const taskToUpdate: Task = {
        ...this.taskToEdit, 
        title: this.task.title,
        description: this.task.description,
        invitation: processedInvitations,
      };
      this.taskService.updateTask(this.createdByUserId, taskToUpdate).then(() => {
        this.taskUpdated.emit(taskToUpdate);
        this.onClose();
      }).catch(err => {
        console.error('Error updating task:', err);
      });
    } else {
      // Modo Creación
      const taskToSave = {
          title: this.task.title,
          description: this.task.description,
          invitation: processedInvitations,
          createdBy: this.createdByUserId,
          completed: false, 
          isSharedCopy: false,
          originalCreatorId: this.createdByUserId
      };

      this.taskService.addTask(this.createdByUserId, taskToSave).then((docRef: DocumentReference) => {
        const newTaskWithId: Task = {
            ...taskToSave,
            id: docRef.id,
        };
        this.taskCreated.emit(newTaskWithId);
        this.onClose();
      }).catch(err => {
        console.error('Error creating task:', err);
      });
    }
  }

  onClose() {
    this.close.emit();
    // Resetear estado para la próxima apertura, especialmente si se cierra sin guardar en modo edición
    setTimeout(() => { // Pequeño delay para permitir que el modal se cierre antes de resetear
        this.taskToEdit = null;
        this.setupComponent();
    }, 0);
  }
}
