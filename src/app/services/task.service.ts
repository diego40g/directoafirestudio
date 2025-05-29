import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc, DocumentReference, query, where, limit, getDocs, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../shared/model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private firestore: Firestore) {}

  private getUserTasksCollection(userId: string) {
    if (!userId) {
      throw new Error('User ID is required to get user tasks collection');
    }
    return collection(this.firestore, `users/${userId}/tasks`);
  }

  private getUserTaskDocRef(userId: string, taskId: string) {
    if (!userId || !taskId) {
      throw new Error('User ID and Task ID are required to get user task document reference');
    }
    return doc(this.firestore, `users/${userId}/tasks/${taskId}`);
  }

  private async findUserIdByEmail(email: string): Promise<string | null> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      return null;
    }
  }

  private async findUserEmailById(userId: string): Promise<string | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data()?.['email'] || null;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user by ID ${userId}:`, error);
      return null;
    }
  }

  // Modify getTasks to filter for completed = false
  getTasks(userId: string): Observable<Task[]> {
    const userTasksCollectionRef = this.getUserTasksCollection(userId);
    const q = query(userTasksCollectionRef, where('completed', '==', false)); // Filter by completed = false
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  async addTask(creatorUserId: string, task: Omit<Task, 'id' | 'originalCreatorId' | 'isSharedCopy'> & { invitation: string[] }): Promise<DocumentReference> {
    const userTasksCollectionRef = this.getUserTasksCollection(creatorUserId);
    const creatorEmail = await this.findUserEmailById(creatorUserId);
    
    const originalTaskData: Omit<Task, 'id'> = {
      ...task,
      createdBy: creatorUserId,
      createdByEmail: creatorEmail || undefined,
      completed: false, // Set default completed to false
      isSharedCopy: false,
      originalCreatorId: creatorUserId,
      originalCreatorEmail: creatorEmail || undefined

    };
    const docRef = await addDoc(userTasksCollectionRef, originalTaskData);
    console.log('Original task created with ID:', docRef.id);

    if (task.invitation && task.invitation.length > 0) {
      for (const email of task.invitation) {
        if (!email || email.trim() === '') continue;

        const invitedUserId = await this.findUserIdByEmail(email.trim());

        if (invitedUserId && invitedUserId !== creatorUserId) {
          const sharedTaskData: Omit<Task, 'id'> = {
            title: task.title,
            description: task.description, 
            createdBy: invitedUserId,
            createdByEmail: await this.findUserEmailById(invitedUserId) || undefined,
            invitation: [], // Shared copies don't forward invitations
            originalCreatorId: creatorUserId,
            originalCreatorEmail: creatorEmail || undefined,
            completed: false, // Set default completed to false for shared tasks


            isSharedCopy: true
          };
          
          try {
            const invitedUserTasksCollectionRef = this.getUserTasksCollection(invitedUserId);
            await addDoc(invitedUserTasksCollectionRef, sharedTaskData);
            console.log(`Task shared with ${email} (User ID: ${invitedUserId})`);
          } catch (error) {
            console.error(`Failed to share task with ${email} (User ID: ${invitedUserId}):`, error);
          }
        } else if (!invitedUserId) {
          console.warn(`User with email ${email.trim()} not found. Task not shared.`);
        } else if (invitedUserId === creatorUserId) {
          console.log(`Attempted to share task with self (${email.trim()}). Skipped.`);
        }
      }
    }
    return docRef;
  }

  // Add new method to update task completion status
  async updateTaskCompletionStatus(userId: string, taskId: string, completed: boolean): Promise<void> {
    const taskDocRef = this.getUserTaskDocRef(userId, taskId);
    return updateDoc(taskDocRef, { completed: completed });
  }

  updateTask(userId: string, task: Task): Promise<void> {
    if (!task.id) {
        return Promise.reject(new Error('Task ID is required for update.'));
    }
    const taskDocRef = this.getUserTaskDocRef(userId, task.id);
    const { id, ...taskData } = task;
    return updateDoc(taskDocRef, taskData);
  }

  deleteTask(userId: string, taskId: string): Promise<void> {
    const taskDocRef = this.getUserTaskDocRef(userId, taskId);
    return deleteDoc(taskDocRef);
  }
}
