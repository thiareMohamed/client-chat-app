<script setup lang="ts">
import { io, Socket } from "socket.io-client";

interface ChatMessage {
    content: string;
    isUser: boolean;
    createdAt: Date;
    senderId?: string;
    roomId?: string;
}

const socket = ref<Socket | null>(null);
const messages = ref<ChatMessage[]>([]);
const newMessage = ref("");
const showEmojiPicker = ref(false);
const senderId = ref("user1");
const roomId = ref("67aae7c1bab009bc2453cddc");

// Connect to Socket.IO
const connectSocket = () => {
    socket.value = io("http://localhost:3001", {
        transports: ["websocket"],
        autoConnect: true,
    });

    socket.value.on("connect", () => {
        console.log("Connected to chat server");
        // Join room
        socket.value?.emit("joinRoom", {
            roomId: roomId.value,
            senderId: senderId.value,
        });
    });

    socket.value.on("message", (data: any) => {
        console.log("Received message:", data);
        messages.value.push({
            content: data.content,
            isUser: data.senderId === senderId.value,
            createdAt: new Date(data.timestamp),
            senderId: data.senderId,
            roomId: data.roomId,
        });
    });

    socket.value.on("disconnect", () => {
        console.log("Disconnected from chat server");
    });

    socket.value.on("error", (error: any) => {
        console.error("Socket error:", error);
    });
};

// watch senderId
watch(senderId, async () => {
    console.log("senderId changed:", senderId.value);
    socket.value?.emit("joinRoom", {
        roomId: roomId.value,
        senderId: senderId.value,
    });
    await fetchMessages();
});

const sendMessage = () => {
    if (!newMessage.value.trim()) return;

    const messageData = {
        content: newMessage.value,
        senderId: senderId.value,
        roomId: roomId.value,
        timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", messageData);
    socket.value?.emit("TEXT", messageData);

    // take message emit for socket and add to messages
    // socket.value?.on("message", (data: any) => {
    //     console.log("Received message:", data);
        
    //     if (senderId.value !== data.senderId) {
    //         messages.value.push(data);
    //     }
    // });

    newMessage.value = "";
};

const fetchMessages = async () => {
    const { data } = await useFetch<ChatMessage[]>('http://localhost:3002/chat/room/67aae7c1bab009bc2453cddc', {
        method: 'GET',
    });
    
    if (data.value) {
        messages.value = data.value.map((msg: any) => ({
            content: msg.content,
            isUser: msg.senderId === senderId.value,
            createdAt: new Date(msg.timestamp || Date.now()),
            senderId: msg.senderId,
            roomId: msg.roomId,
        }));
    }
};

// Connect when component mounts
onMounted(async () => {
    await connectSocket();
    await fetchMessages();
});

// Cleanup on unmount
onUnmounted(() => {
    if (socket.value) {
        socket.value.disconnect();
        socket.value = null;
    }
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${day}/${month}/${year} ${hour}:${minute}`;
};
</script>

<template>
    <div class="chat-container">
        <div class="messages-container">
            <div
                v-for="(message, index) in messages"
                :key="index"
                :class="[
                    'message',
                    message.isUser ? 'user-message' : 'other-message',
                ]"
            >
                <div class="message-content">
                    {{ message.content }}
                </div>
                <div class="message-timestamp">
                    {{ formatDate(message.createdAt.toISOString()) }}
                </div>
            </div>
        </div>

        <!-- input senderId -->
        <input type="text" v-model="senderId" />
        

        <div class="input-container">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Type a message..."
                type="text"
            />
            <button @click="sendMessage">Send</button>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
}

.message {
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 8px;
    max-width: 70%;
}

.user-message {
    background-color: #007bff;
    color: white;
    margin-left: auto;
}

.other-message {
    background-color: #e9ecef;
    margin-right: auto;
}

.message-content {
    margin-bottom: 0.25rem;
}

.message-timestamp {
    font-size: 0.75rem;
    opacity: 0.8;
}

.input-container {
    display: flex;
    gap: 0.5rem;
}

input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>
