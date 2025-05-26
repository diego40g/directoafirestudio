import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User, UserCredential } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore) { }

  async registerWithEmailPassword(email: string, password: string): Promise<void> {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (userCredential.user) {
      await this.updateUserDocument(userCredential.user);
    }
  }

  async loginWithEmailPassword(email: string, password: string): Promise<void> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    if (userCredential.user) {
      await this.updateUserDocument(userCredential.user);
    }
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const userCredential: UserCredential = await signInWithPopup(this.auth, provider);
    if (userCredential.user) {
      await this.updateUserDocument(userCredential.user);
    }
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  onAuthStateChanged(): Observable<User | null> {
    return new Observable<User | null>(observer => {
      const unsubscribe = this.auth.onAuthStateChanged(
        user => observer.next(user),
        error => observer.error(error),
        () => observer.complete()
      );
      return unsubscribe;
    });
  }

  private async updateUserDocument(user: User): Promise<void> {
    if (!user) return;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
    };

    try {
      await setDoc(userRef, userData, { merge: true });
      console.log(`User document updated/created for UID: ${user.uid}`);
    } catch (error) {
      console.error(`Error updating/creating user document for UID: ${user.uid}`, error);
    }
  }
}
