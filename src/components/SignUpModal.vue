<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">✕</button>
      <h2>Sign up</h2>
      <p>Create an account with your username.</p>
      <form @submit.prevent="handleSignUp">
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
            👁️
          </span>
        </div>
        <button type="submit" class="submit-btn">Create your free account</button>
      </form>
      <p class="footer-links">
        Already have an account?
        <a href="#" @click.prevent="$emit('switchToSignIn')">Sign in</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import {register, login, userInfo} from "../api/user.ts";

const username = ref("");
const password = ref("");
const showPassword = ref(false);

const emit = defineEmits(["close", "switchToSignIn", "signupSuccess"]);

function handleSignUp() {
  // Handle sign-up logic
  register({
    name: username.value,
    password: password.value
  }).then(res => {
    if(res.data.code === '000') {
      login({
        name: username.value,
        password: password.value
      }).then(res => {
        if(res.data.code === '000') {
          const token = res.data.result
          sessionStorage.setItem('token', token)

          userInfo().then(res => {
            sessionStorage.setItem('user', res.data.result.name)
          })
          emit("signupSuccess", { name: username.value });
          emit("close");
          window.location.reload();
        } else if (res.data.code === '400') {
          console.log("login after sign up failed")
          ElMessage({
            message: res.data.msg,
            type: 'error',
            center: true,
          })
          username.value = ''
          password.value = ''
        }
      })
    } else if(res.data.code === '400') {
      alert("Sign up failed!");
      username.value = '';
      password.value = '';
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
  z-index: 1000;
}

/* Modal content */
.modal-content {
  background: #fff;
  width: 90%;
  max-width: 300px;
  min-height: 400px;
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
  font-size: 14px;
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
