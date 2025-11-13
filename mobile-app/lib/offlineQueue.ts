import AsyncStorage from '@react-native-async-storage/async-storage';

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface PendingOperation {
  id: string;
  type: OperationType;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  noteId?: string; // Pour UPDATE et DELETE
  timestamp: number;
  retries: number;
}

const QUEUE_STORAGE_KEY = 'pending_operations_queue';
const MAX_RETRIES = 3;

/**
 * Service de gestion de la file d'opérations en attente pour le mode offline
 */
class OfflineQueueService {
  /**
   * Récupère toutes les opérations en attente depuis AsyncStorage
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const queueStr = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueStr) return [];
      return JSON.parse(queueStr);
    } catch (error) {
      return [];
    }
  }

  /**
   * Ajoute une opération à la file d'attente
   */
  async enqueueOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    try {
      const queue = await this.getPendingOperations();
      const newOperation: PendingOperation = {
        ...operation,
        id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retries: 0,
      };
      queue.push(newOperation);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime une opération de la file d'attente
   */
  async removeOperation(operationId: string): Promise<void> {
    try {
      const queue = await this.getPendingOperations();
      const filtered = queue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Marque une opération comme ayant échoué (incrémente retries)
   */
  async markOperationFailed(operationId: string): Promise<void> {
    try {
      const queue = await this.getPendingOperations();
      const operation = queue.find(op => op.id === operationId);
      if (operation) {
        operation.retries += 1;
        // Si trop de tentatives, supprimer l'opération
        if (operation.retries >= MAX_RETRIES) {
          await this.removeOperation(operationId);
        } else {
          await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        }
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Vide complètement la file d'attente
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (error) {
      // Erreur silencieuse
    }
  }

  /**
   * Récupère le nombre d'opérations en attente
   */
  async getQueueLength(): Promise<number> {
    const queue = await this.getPendingOperations();
    return queue.length;
  }
}

export const offlineQueue = new OfflineQueueService();

