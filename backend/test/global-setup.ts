import { TestDatabaseManager } from './utils/test-container.util';

export default async () => {
  await TestDatabaseManager.startContainer();
  // We need to pass the connection string to the workers.
  // Setting it in process.env in globalSetup DOES pass it to workers in some Jest versions,
  // but to be safe we can write it to a temp file or rely on process.env.
  // Actually, TestDatabaseManager in worker will see container=null and start a new one.
};
