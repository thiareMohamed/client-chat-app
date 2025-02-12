<template>
  <div>
    <h1>Group Video Call</h1>

    <!-- Affichage des vidéos de chaque participant -->
    <div v-for="(peerStream, peerId) in peers" :key="peerId">
      <video :ref="peerId" autoplay></video>
    </div>

    <div v-if="callActive">
      <video ref="localVideo" autoplay muted></video>
      <button @click="endCall">End Call</button>
    </div>

    <div v-else>
      <button @click="joinRoom">Join Room</button>
      <button @click="makeGroupCall">Start Group Call</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Peer from "peerjs";
import { io } from "socket.io-client";

const socket = io("http://localhost:3003");
const peer = ref(null);
const peers = ref({});
const localStream = ref(null);
const callActive = ref(false);
const roomId = ref("67aae819d5ce6c2301aa8866");
const targetPeerIds = ref(["user1", "user2"]);

onMounted(() => {
  // Initialize PeerJS
  peer.value = new Peer(undefined, {
    host: "localhost",
    port: 3004,
    path: "/peerjs",
  });

  //  autorisation de la camera et micro
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    localStream.value = stream;
  });

  peer.value.on("open", (id) => {
    console.log("Peer ID:", id);
    socket.emit("joinRoom", roomId.value);
  });

  peer.value.on("call", (call) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream.value = stream;
      call.answer(stream);
      call.on("stream", (remoteStream) => {
        peers.value[call.peer] = remoteStream;
      });
    });
  });

  socket.on("callIncoming", (data) => {
    console.log("Incoming call from:", data.from);
    if (confirm(`Receive call from ${data.from}`)) {
      socket.emit("answerGroupCall", { roomId: data.roomId, from: data.from });
      callGroup(data.roomId, data.from);
    }
  });

  socket.on("callAnswered", (data) => {
    callGroup(data.roomId, data.to);
  });
});

function joinRoom() {
  socket.emit("joinRoom", roomId.value);
}

function makeGroupCall() {
  socket.emit("callGroup", { roomId: roomId.value, targetIds: targetPeerIds.value });
}

function callGroup(roomId, targetId) {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream.value = stream;
      const call = peer.value.call(targetId, stream);

      call.on("stream", (remoteStream) => {
        peers.value[targetId] = remoteStream;
      });

      call.on("close", () => {
        delete peers.value[targetId];
      });
    })
    .catch((err) => console.log("Error accessing media devices:", err));
}

function endCall() {
  peer.value.disconnect();
  callActive.value = false;
}
</script>

<style scoped>
video {
  width: 100%;
  max-width: 300px;
  margin: 10px;
}
button {
  padding: 10px;
  margin-top: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
