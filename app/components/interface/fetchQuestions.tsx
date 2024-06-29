'use server';
import { Db, MongoClient } from 'mongodb';

let hostname = '9-k.h.filess.io';
let database = 'TopicAll_fieldlearn';
let port = '27018';
let username = 'TopicAll_fieldlearn';
let password = 'bb453f1e1435e615f7aac7bde4c71a9bfc9f87a2';

let url =
  'mongodb://' +
  username +
  ':' +
  password +
  '@' +
  hostname +
  ':' +
  port +
  '/' +
  database;

export async function fetchedQuestions(): Promise<
  { id: number; text: string }[]
> {
  console.log('Connecting...');
  try {
    const client = await MongoClient.connect(url || '');
    const db: Db = client.db(process.env.MONGODB_DATABASE || '');
    const collection = db.collection('questions');
    const questions = await collection.find().toArray();
    await client.close();
    console.log('Connected successfully to server.');
    return questions.flatMap((question) =>
      question.questions.map(
        (nestedQuestion: { id: number; text: string }) => ({
          id: nestedQuestion.id,
          text: nestedQuestion.text,
        })
      )
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Failed to fetch questions: ' + err.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}
