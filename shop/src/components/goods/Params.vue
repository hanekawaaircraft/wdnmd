<template>
  <div>
    <!-- 面包屑导航区域 -->
    <Breadcrumb>
      <BreadcrumbItem :to="{ path: '/home' }">
        <Icon type="ios-home-outline"></Icon> 首页
      </BreadcrumbItem>
      <BreadcrumbItem>
        <Icon type="logo-buffer"></Icon> 商品管理
      </BreadcrumbItem>
      <BreadcrumbItem>
        <Icon type="ios-cafe"></Icon> 分类标签
      </BreadcrumbItem>
    </Breadcrumb>

    <!-- 卡片视图区域 -->
    <Card>
      <!-- 警告区域 -->
      <Alert show-icon type="warning" :closable="false">注意：只允许为三层结构项设置相关参数！</Alert>

      <!-- 选择商品分类区域 -->
      <Row class="cat_opt">
        <Col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange"></el-cascader>
          <!-- <Cascader trigger="hover" :data="catelist" v-model="selectedCateKeys" render-format="cateProps"></Cascader> -->
        </Col>
      </Row>

      <!-- tab 页签区域 -->
      <Tabs v-model="activeName" @on-click="handleTabClick">
        <!-- 添加商品参数的面板 -->
        <TabPane label="商品参数" name="many">
          <!-- 添加参数的按钮 -->
          <Button type="primary" size="small" :disabled="isBtnHide" @click="addModalShow=true" class="buttonAdd">添加参数</Button>
          <!-- 商品参数表格 -->
          <Table border :columns="columns" :data="manyTableData">
            <template slot-scope="scope" slot="attribute">
              <!-- 循环渲染Tag标签 -->
              <Tag color="primary" v-for="(item, i) in scope.row.attr_vals" :key="i" closable @on-close="handleClose(i, scope.row)">{{item}}</Tag>
              <!-- 输入的文本框 -->
              <Input class="input-new-tag" v-if="scope.row.inputShow" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
              </Input>
              <!-- 添加按钮 -->
              <Button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</Button>
            </template>
            <template slot-scope="scope" slot="active">
              <Button size="small" type="primary" @click="showEditModal(scope.row.attr_id)">编辑</Button>
              &nbsp;
              <Button size="small" @click="removeParams(scope.row.attr_id)">删除</Button>
            </template>
          </Table>  
        </TabPane>
        <!-- 添加商品属性的面板 -->
        <TabPane label="商品属性" name="only">
          <!-- 添加属性的按钮 -->
          <Button type="primary" size="small" :disabled="isBtnHide" @click="addModalShow=true" class="buttonAdd">添加属性</Button>
          <!-- 商品属性表格 -->
          <Table border :columns="columns" :data="onlyTableData">
            <template slot-scope="scope" slot="attribute">
              <!-- 循环渲染Tag标签 -->
              <Tag color="primary" v-for="(item, i) in scope.row.attr_vals" :key="i" closable @on-close="handleClose(i, scope.row)">{{item}}</Tag>
              <!-- 输入的文本框 -->
              <Input class="input-new-tag" v-if="scope.row.inputShow" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
              </Input>
              <!-- 添加按钮 -->
              <Button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</Button>
            </template>
            <template slot-scope="scope" slot="active">
              <Button size="small" type="primary" @click="showEditModal(scope.row.attr_id)">编辑</Button>
              &nbsp;
              <Button size="small" @click="removeParams(scope.row.attr_id)">删除</Button>
            </template>
          </Table>
        </TabPane>
      </Tabs>
    </Card>

    <!-- 添加参数的对话框 -->
    <Modal :title="'添加' + titleText" v-model="addModalShow" width="50%" @close="addModalHide">
      <!-- 添加参数的对话框 -->
      <Form :model="addForm" :rules="addFormRules" ref="addFormRef">
        <FormItem :label="titleText" prop="attr_name">
          <Input v-model="addForm.attr_name"></Input>
        </FormItem>
      </Form>
      <span slot="footer" class="dialog-footer">
        <Button @click="addModalShow = false">取 消</Button>
        &nbsp;
        <Button type="primary" @click="addParams">确 定</Button>
      </span>
    </Modal>

    <!-- 修改参数的对话框 -->
    <Modal :title="'修改' + titleText" v-model="editModalShow" width="50%" @close="editModalHide">
      <!-- 添加参数的对话框 -->
      <Form :model="editForm" :rules="editRules" ref="editFormRef">
        <FormItem :label="titleText" prop="attr_name">
          <Input v-model="editForm.attr_name"></Input>
        </FormItem>
      </Form>
      <span slot="footer" class="dialog-footer">
        <Button @click="editModalShow = false">取 消</Button>
        &nbsp;
        <Button type="primary" @click="editParams">确 定</Button>
      </span>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //iview渲染商品参数表格
      columns: [
        {
          type:'index',
          width: 60,
          align: 'center'
        },
        {
          title: '参数名称',
          key: 'attr_name',
          width:200
        },
        {
          title: '标签',
          key: 'attribute',
          slot: 'attribute'
        },
        {
          title: '操作',
          slot: 'active',
          align: 'center',
          width:150
        }
      ],
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 商品参数的数据
      manyTableData: [],
      // 商品属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addModalShow: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editModalShow: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取参数的列表数据
    getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      // 证明选中的是三级分类
       // 根据所选分类的Id，和当前所处的面板，获取对应的参数
      this.$http.get(`categories/${this.cateId}/attributes`,{
          params: { sel: this.activeName }
        }).then(res=>{
        let body=res.data
        if(body.meta.status==200){
          body.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制文本框的显示与隐藏
            item.inputShow = false
            // 文本框中输入的值
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = body.data
          } else {
            this.onlyTableData = body.data
          }
        }else{
          this.$message.error('获取参数列表失败')
        }
      })
    },
    // 获取所有的商品分类列表
    getCateList() {
      this.$http.get('categories').then(res=>{
        if(res.data.meta.status==200){
          this.catelist=res.data.data
        }else{
          this.$message.error('获取商品分类失败!')
        }
      })
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    // tab 页签点击事件的处理函数
    handleTabClick() {
      this.selectedCateKeys = []
      this.manyTableData = []
      this.onlyTableData = []
      console.log(this.activeName)
      this.getParamsData()
    },
    // 监听添加对话框的关闭事件
    addModalHide() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return
        this.$http.post( `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }).then(res=>{
            let body=res.data 
            if(body.meta.status==201){
              this.$message.success('添加参数成功！')
              this.addModalShow = false
              this.getParamsData()
            }else{
              this.$message.error('添加参数失败')
            }
          })
      })
    },
    // 点击按钮，展示修改的对话框
    showEditModal(attrId) {
      // 查询当前参数的信息
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }).then(res=>{
          let body=res.data
          if(body.meta.status==200){
            this.editForm = body.data
            this.editModalShow = true
          }else{
            this.$message.error('获取参数信息失败！')
          }
        })
    },
    // 重置修改的表单
    editModalHide() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
        { 
          attr_name: this.editForm.attr_name, attr_sel: this.activeName 
        }).then(res=>{
          let body=res.data
          if(body.meta.status==200){
            this.$message.success('修改参数成功！')
            this.getParamsData()
            this.editModalShow = false
          }else{
            this.$message.error('修改参数失败！')
          }
        })
      })
    },
    // 根据Id删除对应的参数项
    async removeParams(attrId) {
      const MsgResult = await this.$confirm(
        '此操作将删除这个参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 用户取消了删除的操作
      if (MsgResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      // 删除的业务逻辑
      this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      ).then(res=>{
        if (res.data.meta.status !== 200) {
          return this.$message.error('删除参数失败！')
        }else{
          this.$message.success('删除参数成功！')
          this.getParamsData()
        }
      })
    },
    // 文本框失去焦点，或摁下了 Enter 都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputShow = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputShow = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      this.$http.put(
         `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      ).then(res=>{
         if (res.data.meta.status !== 200) {
          return this.$message.error('修改参数项失败！')
        }else{
          this.$message.success('修改参数项成功！')
        }
      })
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputShow = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnHide() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '商品参数'
      }
      return '商品属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.buttonAdd{
  margin-bottom: 15px;
}
.ivu-tag  {
  margin: 5px;
}
.button-new-tag {
  margin: 5px
}
</style>
