<template>
    <transition name="fade">
        <div v-if="toast.visible" :class="['toast', toast.type]">
            {{ toast.message }}
        </div>
    </transition>
</template>

<script>
import { useToastStore } from '@/stores/toast'

export default {
    setup() {
        const toast = useToastStore()
        return { toast }
    },
}
</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    opacity: 1;
}

.toast.success {
    background-color: #10b981;
}

.toast.error {
    background-color: #ef4444;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
