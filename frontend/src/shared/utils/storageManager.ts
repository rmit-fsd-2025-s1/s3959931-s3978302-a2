// Enhanced localStorage manager with validation, error handling and fallback mechanisms
// Optimized for assignment requirements - no external dependencies

interface StorageData<T> {
    version: number;
    data: T;
    timestamp: number;
}

class StorageManager {
    private static readonly CURRENT_VERSION = 1;
    private static fallbackStorage = new Map<string, string>();

    static isAvailable(): boolean {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            console.warn('localStorage not available, using fallback storage');
            return false;
        }
    }

    static setItem(key: string, value: string): void {
        try {
            if (this.isAvailable()) {
                localStorage.setItem(key, value);
                this.trackUsage('write', key, true);
            } else {
                this.fallbackStorage.set(key, value);
                this.trackUsage('write', key, false);
            }
        } catch (e) {
            console.error(`Storage error writing key '${key}':`, e);
            this.fallbackStorage.set(key, value);
            this.trackUsage('write', key, false);
        }
    }

    static getItem(key: string): string | null {
        try {
            if (this.isAvailable()) {
                const result = localStorage.getItem(key);
                this.trackUsage('read', key, true);
                return result;
            } else {
                const result = this.fallbackStorage.get(key) || null;
                this.trackUsage('read', key, false);
                return result;
            }
        } catch (e) {
            console.error(`Storage error reading key '${key}':`, e);
            const result = this.fallbackStorage.get(key) || null;
            this.trackUsage('read', key, false);
            return result;
        }
    }

    static removeItem(key: string): void {
        try {
            if (this.isAvailable()) {
                localStorage.removeItem(key);
                this.trackUsage('delete', key, true);
            } else {
                this.fallbackStorage.delete(key);
                this.trackUsage('delete', key, false);
            }
        } catch (e) {
            console.error(`Storage error removing key '${key}':`, e);
            this.fallbackStorage.delete(key);
            this.trackUsage('delete', key, false);
        }
    }

    // Versioned storage for complex data
    static setVersionedItem<T>(key: string, data: T): void {
        const versionedData: StorageData<T> = {
            version: this.CURRENT_VERSION,
            data,
            timestamp: Date.now()
        };

        this.setItem(key, JSON.stringify(versionedData));
    }

    static getVersionedItem<T>(key: string): T | null {
        try {
            const item = this.getItem(key);
            if (!item) return null;

            const versionedData: StorageData<T> = JSON.parse(item);

            // Check version compatibility
            if (versionedData.version !== this.CURRENT_VERSION) {
                console.warn(`Data version mismatch for ${key}, migrating...`);
                return this.migrateData(key, versionedData);
            }

            return versionedData.data;
        } catch (e) {
            console.error(`Error reading versioned data for ${key}:`, e);
            return null;
        }
    }

    private static migrateData<T>(key: string, oldData: StorageData<unknown>): T | null {
        try {
            // Simple migration - for now just return data as-is and update version
            const migratedData = oldData.data as T;
            this.setVersionedItem(key, migratedData);
            return migratedData;
        } catch (e) {
            console.error(`Migration failed for ${key}:`, e);
            this.removeItem(key);
            return null;
        }
    }

    // Simple logging - no external analytics per assignment requirements
    private static trackUsage(operation: 'read' | 'write' | 'delete', key: string, success: boolean): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`localStorage ${operation} for key '${key}': ${success ? 'success' : 'failed'}`);
        }
    }

    // Storage health monitoring
    static checkStorageHealth(): void {
        if (!this.isAvailable()) return;

        try {
            let total = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }

            const usage = total / (5 * 1024 * 1024); // Assume 5MB limit
            if (usage > 0.8) { // 80% full
                console.warn('localStorage is nearly full, consider cleanup');
            }

            if (process.env.NODE_ENV === 'development') {
                console.log(`Storage usage: ${Math.round(usage * 100)}%`);
            }
        } catch (e) {
            console.error('Error checking storage health:', e);
        }
    }
}

export default StorageManager; 