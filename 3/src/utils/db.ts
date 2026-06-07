import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ScenarioType, Reply } from '../types';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  doctorInput: string;
  patientContext: string;
  scenarioType: ScenarioType;
  replies: Reply;
  mode: 'api' | 'mock';
}

export interface Template {
  id: string;
  name: string;
  doctorInput: string;
  patientContext: string;
  scenarioType: ScenarioType;
}

interface V3DB extends DBSchema {
  history: {
    key: string;
    value: HistoryRecord;
    indexes: { 'by-timestamp': number };
  };
  templates: {
    key: string;
    value: Template;
  };
}

const DB_NAME = 'medical-assistant-v3';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<V3DB>> | null = null;

const getDB = async (): Promise<IDBPDatabase<V3DB>> => {
  if (!dbPromise) {
    dbPromise = openDB<V3DB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<V3DB>) {
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const loadHistory = async (): Promise<HistoryRecord[]> => {
  const db = await getDB();
  const all = await db.getAllFromIndex('history', 'by-timestamp');
  return all.reverse().slice(0, 20);
};

export const saveToHistory = async (record: Omit<HistoryRecord, 'id' | 'timestamp'>): Promise<HistoryRecord[]> => {
  const db = await getDB();
  const newRecord: HistoryRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await db.put('history', newRecord);
  return loadHistory();
};

export const deleteHistoryItem = async (id: string): Promise<HistoryRecord[]> => {
  const db = await getDB();
  await db.delete('history', id);
  return loadHistory();
};

export const clearAllHistory = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('history');
};

export const loadTemplates = async (): Promise<Template[]> => {
  const db = await getDB();
  return db.getAll('templates');
};

export const saveTemplate = async (template: Omit<Template, 'id'>): Promise<Template[]> => {
  const db = await getDB();
  const newTemplate: Template = {
    ...template,
    id: crypto.randomUUID(),
  };
  await db.put('templates', newTemplate);
  return loadTemplates();
};

export const deleteTemplateItem = async (id: string): Promise<Template[]> => {
  const db = await getDB();
  await db.delete('templates', id);
  return loadTemplates();
};
