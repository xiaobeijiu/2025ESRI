<template>
  <div class="form-container">
    <h2>表单上传</h2>
    <el-form :model="form" label-width="80px">
      <el-form-item label="姓名">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="联系方式">
        <el-input v-model="form.contact"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
        >
          <el-button type="primary">选择文件</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({ name: '', contact: '', description: '', file: null })

const handleFileChange = (file) => form.value.file = file.raw

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('contact', form.value.contact)
  formData.append('description', form.value.description)
  if(form.value.file) formData.append('file', form.value.file)

  try {
    const res = await axios.post('http://localhost:3000/api/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    alert('上传成功！')
    console.log(res.data)
  } catch (err) {
    console.error(err)
    alert('上传失败')
  }
}
</script>
