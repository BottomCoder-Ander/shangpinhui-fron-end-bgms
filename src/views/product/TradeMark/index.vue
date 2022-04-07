<template>
  <div>
    <!-- 添加按钮 -->
    <el-button type="primary" icon="el-icon-plus" @click="addTradeMark"
      >添加</el-button
    >
    <!-- table表格 -->
    <el-table style="width: 100%; margin: 30px 0px" border :data="records">
      <el-table-column
        label="序号"
        width="80px"
        type="index"
        align="center"
      ></el-table-column>
      <!-- prop:数据数组里面对象相应的字段：就展示相应的数据 -->
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column label="品牌logo" width="width">
        <template v-slot="{ row, index }">
          <img :src="row.logoUrl" style="width:100px;height=100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <!-- v-slot，插槽接收传过来的数据, 数据被elementui
          封装成{row:每一条数据，index:下标}的形式,
          row就是传给table的data数组的每一项 -->
        <template v-slot="{ row, index }">
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-edit"
            @click="updateTradeMark(row)"
            style="margin-right: 10px"
            >修改</el-button
          >
          <el-popconfirm
            :title="`你是要删除${row.tmName}?`"
            icon="el-icon-delete"
            @onConfirm="removeTradeMark(row)"
          >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              slot="reference"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <!-- @size-change="handleSizeChange"    当前页的显示数据条数放生变化会出发 @current-change="handleCurrentChange"  当当前页发生变化的时候会触发-->
    <el-pagination
      style="textalign: center"
      :current-page="page"
      :page-size="limit"
      :page-sizes="[3, 5, 10]"
      :total="total"
      layout="prev, pager, next, jumper,->,sizes,total"
      @current-change="getTradeMarkList"
      @size-change="handleSizeChange"
    >
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="cur">
        <el-form-item label="品牌名称" label-width="80px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌logo" label-width="80px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :show-file-list="false"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <!-- 具名插槽tip -->
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  computed: {
    uploadUrl() {
      return process.env.VUE_APP_BASE_API + "/admin/product/fileUpload";
    },
  },
  data() {
    // 自定义elementUI表单验证规则
    var validatetmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称应该是2-10位"));
      } else {
        callback();
      }
    };
    return {
      trademarkAPI: this.$api.product.trademark,
      //初始化数据
      page: 1, //代表当前第几页
      limit: 5, //代表每一个展示多少条数据
      total: 0, //分页器一共要展示的数据,
      records: [], //表格展示产品的数据
      dialogFormVisible: false, //控制对话框显示与隐藏
      //收集添加品牌的数据
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      //表单验证规则
      rules: {
        //form进行表单验证的时候，form需要加上:model属性，一级form-item需要书写prop，即为验证字段
        //验证表单的时候字段切记对应上
        //trigger: blur||change,在什么情况下进行表单验证
        tmName: [
          { required: true, message: "请输入品牌的名称", trigger: "change" },
          // 表单验证规则
          // {min: 2,max: 10,message: "长度在 2到 10 个字符",trigger: "change"}
          // 传入自定义校验规则validatetmName
          { validator: validatetmName, trigger: "change" },
        ],
        // logoUrl字段：不是表单元素【input、textArea、select】，所以不能用trigger
        logoUrl: [{ required: true, message: "请你选择品牌logo" }],
      },
    };
  },
  mounted() {
    //获取数据的方法
    this.getTradeMarkList();
  },
  methods: {
    //获取品牌列表数据
    getTradeMarkList(curPage = 1) {
      //重新修改page
      this.page = curPage;
      const { page, limit } = this;

      this.trademarkAPI
        .reqTradeMarkList(page, limit)
        .then((response) => {
          this.total = response.data.total;
          this.records = response.data.records;
        })
        .catch((error) => {
          this.$message.error("获取品牌列表失败，" + error);
        });
    },
    //当每一页展示的数据条数发生变化的时候触发，跳回第一页
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTradeMarkList();
    },
    //添加按钮的回调函数
    addTradeMark() {
      //对话跨显示出来
      this.dialogFormVisible = true;
      //把收集的数据清空
      this.tmForm = { tmName: "", logoUrl: "" };
    },
    //上传成功后的回调
    handleAvatarSuccess(res, file) {
      //收集图片信息，添加品牌的时候收集的数据
      this.tmForm.logoUrl = res.data;
      // 使用下面这个是拿本地的图片地址，而上传需要的是图片在网站的地址。
      // this.tmForm.logoUrl = URL.createObjectURL(file.raw);
    },
    // 上传图片前的回调，可以做一些验证，返回false表示不上传
    beforeAvatarUpload(file) {
      const isJPGOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPGOrPng) {
        this.$message.error("上传图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPGOrPng && isLt2M;
    },
    //对话框中的确定按钮
    addOrUpdateTradeMark() {
      //获取form，进行全部item项验证，如果验证成功，再发请求，如果有一个失败，不能发请求；
      this.$refs.cur.validate((success) => {
        //全部项进行验证成功
        if (success) {
          this.dialogFormVisible = false;
          //接受tmForm
          let tmForm = this.tmForm;
          //发请求---添加品牌||修改品牌数据【区别在于tmForm是否包含id】
          //如果添加||修改成功，需要再次发请求，获取产品列表数据
          //成功（添加|修改）
          let req = this.tmForm.id
            ? this.trademarkAPI.reqAddTradeMark(tmForm)
            : this.trademarkAPI.reqUpdateTradeMark(tmForm);
          req.then(
            (response) => {
              this.$message({
                showClose: true,
                message: this.tmForm.id ? "修改成功" : "新增成功",
                type: "success",
              });
              //添加新的品牌，会导致总页数发生变化，确实应该回调第一页
              //修改某一个品牌的数据，应该停留在当前页
              this.getTradeMarkList(tmForm.id ? this.page : 1);
            },
            (reason) => {
              this.$message.error(reason);
            }
          );
        } else {
          //表单验证某一项失败。这个有啥用
          return false;
        }
      });
    },
    //修改某一个品牌的数据，弹出对话框
    updateTradeMark(row) {
      //对话框显示出来
      this.dialogFormVisible = true;
      //展示要修改品牌数据
      //必须深拷贝，如果浅拷贝直接=row的话，那修改对话框就直接改动列表上的项了
      // 也就是修改tmForm会修改到row这是不允许的，所以采用深拷贝
      this.tmForm = { ...row };
    },
    //删除某一个品牌的数据，row就是要删除的数据项
    removeTradeMark(row) {
      this.trademarkAPI.reqDeleteTradeMarkById(row.id).then(
        (response) => {
          //成功获取数据
          //当前页数的展示数据个数判断：如果显示数据个数大于1，当前页，如果小于1，回到上一页
          this.getTradeMarkList(
            this.records.length > 1 ? this.page : this.page - 1
          );
          this.$message({
            showClose: true,
            message: "删除成功",
            type: "success",
          });
        },
        (reason) => {
          this.$message.error("删除失败，" + reason);
        }
      );
    },
  },
};
</script>


<style>
/* upload组件的样式 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
