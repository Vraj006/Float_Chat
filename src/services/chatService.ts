import { db } from '@/lib/firebase';
import {
	collection,
	addDoc,
	setDoc,
	getDoc,
	getDocs,
	deleteDoc,
	doc,
	serverTimestamp,
	updateDoc,
	query,
	where,
	orderBy,
	Timestamp,
	writeBatch,
	limit,
	DocumentReference
} from 'firebase/firestore';

export type ChatMessage = {
	id?: string;
	type: 'user' | 'bot';
	content: string;
	timestamp: Date | Timestamp;
	attachedFile?: string | null;
	hasChart?: boolean;
	chartType?: 'temperature' | 'species' | 'table' | string;
	suggestions?: string[];
};

export type ChatThread = {
	id: string;
	title: string;
	createdAt: Date | Timestamp;
	updatedAt: Date | Timestamp;
	userId: string;
	lastMessagePreview?: string;
};

const userChatsCollection = (userId: string) => collection(db, 'users', userId, 'chats');
const chatMessagesCollection = (userId: string, chatId: string) => collection(db, 'users', userId, 'chats', chatId, 'messages');

export async function createNewChat(userId: string, title: string = 'New Chat'): Promise<ChatThread> {
	const chatDoc = await addDoc(userChatsCollection(userId), {
		title,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
		userId,
		lastMessagePreview: ''
	});
	return { id: chatDoc.id, title, createdAt: new Date(), updatedAt: new Date(), userId };
}

export async function updateChatTitle(userId: string, chatId: string, title: string): Promise<void> {
	await updateDoc(doc(db, 'users', userId, 'chats', chatId), { title, updatedAt: serverTimestamp() });
}

export async function listChats(userId: string): Promise<ChatThread[]> {
	const q = query(userChatsCollection(userId), orderBy('updatedAt', 'desc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function deleteChat(userId: string, chatId: string): Promise<void> {
	await deleteChatWithMessages(userId, chatId);
}

async function deleteChatWithMessages(userId: string, chatId: string): Promise<void> {
	// Delete messages first
	while (true) {
		const q = query(chatMessagesCollection(userId, chatId), orderBy('timestamp', 'asc'), limit(500));
		const snapshot = await getDocs(q);
		if (snapshot.empty) break;
		const batch = writeBatch(db);
		snapshot.docs.forEach((d) => batch.delete(d.ref));
		await batch.commit();
	}
	// Delete chat doc
	await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
}

export async function clearChatMessages(userId: string, chatId: string): Promise<void> {
	// Delete all messages in batches to avoid quota limits
	while (true) {
		const q = query(chatMessagesCollection(userId, chatId), orderBy('timestamp', 'asc'), limit(500));
		const snapshot = await getDocs(q);
		if (snapshot.empty) break;
		const batch = writeBatch(db);
		snapshot.docs.forEach((d) => batch.delete(d.ref));
		await batch.commit();
	}
	// Reset chat metadata
	await updateDoc(doc(db, 'users', userId, 'chats', chatId), { updatedAt: serverTimestamp(), lastMessagePreview: '' });
}

export async function deleteAllChats(userId: string): Promise<void> {
	const chats = await listChats(userId);
	for (const chat of chats) {
		await deleteChatWithMessages(userId, chat.id);
	}
}

export async function saveMessage(userId: string, chatId: string, message: ChatMessage): Promise<void> {
	const payload = {
		type: message.type,
		content: message.content,
		timestamp: message.timestamp instanceof Date ? Timestamp.fromDate(message.timestamp) : message.timestamp,
		attachedFile: message.attachedFile ?? null,
		hasChart: message.hasChart ?? false,
		chartType: message.chartType ?? null,
		suggestions: message.suggestions ?? []
	};
	await addDoc(chatMessagesCollection(userId, chatId), payload);
	await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
		updatedAt: serverTimestamp(),
		lastMessagePreview: message.content.slice(0, 120)
	});
}

export async function loadMessages(userId: string, chatId: string): Promise<ChatMessage[]> {
	const q = query(chatMessagesCollection(userId, chatId), orderBy('timestamp', 'asc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
} 