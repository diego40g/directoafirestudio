import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../shared/model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksCollection;
   
  constructor(private firestore: Firestore) {
    this.tasksCollection = collection(this.firestore, 'tasks');
  }

  getTasks(): Observable<Task []> {
    return collectionData(this.tasksCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  addTask(task: Omit<Task, 'id'>): Promise<any> {
    return addDoc(this.tasksCollection, task);
  }

  updateTask(task: Task): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
    return updateDoc(taskDocRef, { ...task });
  }

  deleteTask(taskId: string): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDocRef);
  }
}
