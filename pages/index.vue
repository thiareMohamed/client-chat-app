<script setup lang="ts">
const isChat = ref(true);

function toggleChat(value: boolean) {
  isChat.value = value;
}
</script>

<template>
  <div class="container">
    <div class="content flex flex-col h-full overflow-y-auto">
      <template v-if="isChat">
        <Chat />
      </template>
      <template v-else>
        <Meet />
      </template>
    </div>

    <nav class="bottom-nav">
      <button @click="toggleChat(true)" class="nav-item">
        <i class="fas fa-comments"></i>
        <span>Chat</span>
      </button>
      <button @click="toggleChat(false)" class="nav-item">
        <i class="fas fa-video"></i>
        <span>Meet</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 0.8rem;
  background: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

.nav-item:hover {
  color: #007bff;
}

.nav-item i {
  font-size: 1.2rem;
}

.nav-item span {
  font-size: 0.8rem;
}
</style>
