<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">✕</button>
      <h2>Sign in</h2>
      <p>Sign in with your username here.</p>
      <form @submit.prevent="handleSignIn">
        <input
            type="text"
            placeholder="Username"
            v-model="username"
            required
        />
        <div class="password-container">
          <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              v-model="password"
              required
          />
          <span
              class="toggle-password"
              @click="showPassword = !showPassword"
          >
            <img src="../../public/eye.png"  style="width: 20px; height: 20px;"/>
          </span>
        </div>
        <button type="submit" class="submit-btn">Sign in</button>
      </form>
      <p class="footer-links">
        Don't have an account?
        <a href="#" @click.prevent="$emit('switchToSignUp')">Sign up</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { login, getUserInfo } from "../api/user";

const username = ref('');
const password = ref('');
const showPassword = ref(false);

const emit = defineEmits(["close", "switchToSignUp", "loginSuccess"]);

function handleSignIn() {
  // Handle sign-in logic
  login({
    name: username.value,
    password: password.value
  }).then(res => {
    if(res.data.code === '000') {
      const token = res.data.result
      sessionStorage.setItem('token', token)

      getUserInfo().then(res => {
        console.log("getting userInfo")
        sessionStorage.setItem('name', res.data.result.name)
      })
      console.log(sessionStorage.getItem('name'))
      emit("loginSuccess", { name: username.value });
      console.log(username.value);
      console.log("here!");
      emit("close");
      window.location.reload();
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}

function closeModal() {
  emit("close");
}
</script>

<style scoped>
/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Modal content */
.modal-content {
  background: #fff;
  width: 90%;
  max-width: 300px;
  min-height: 350px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

h2 {
  font-size: 35px;
  font-weight: bold;
  margin-bottom: 10px;
}

p {
  margin-bottom: 20px;
  color: #777;
}

/* Input styles */
input {
  width: 100%;
  height: 42px;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input::placeholder {
  color: #ccc;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.password-container {
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  height: 42px;
  padding: 10px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #0056b3;
}

.policy a {
  color: #007bff;
  text-decoration: none;
}

.policy a:hover {
  text-decoration: underline;
}

.footer-links {
  font-size: 16px;
  margin-top: 10px;
}

.footer-links a {
  color: #007bff;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>
