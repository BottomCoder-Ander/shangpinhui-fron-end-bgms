<template>
  <div>
    <!-- 展示三级联动 -->
    <el-card>
      <!-- 三级联动自定义事件:可以把商品分类的一、二、三id回传 -->
      <CategorySelect
        @getDataByCategoryId="getDataByCategoryId"
        :show="scene != 0"
      />
    </el-card>
    <!--三部分内容进行切换-->
    <el-card style="margin-top: 20px">
      <!-- SPU列表静态 -->
      <div v-show="scene == 0">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSpu"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <!-- 表格 -->
        <el-table style="width: 100%" border :data="spuList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="spuName"
            label="SPU名称"
            width="width"
          ></el-table-column>
          <el-table-column
            prop="description"
            label="SPU描述"
            width="width"
          ></el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                title="添加SKU"
                @click="toSkuForm(row)"
              ></el-button>
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改SPU"
                @click="updateSpu(row)"
              ></el-button>
              <el-button
                type="info"
                icon="el-icon-warning"
                size="mini"
                title="查看当前SPU的全部SKU"
                @click="showSkuList(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除SPU"
                @click="deleteSpuById(row)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <!-- @@current-change:自定义事件，当用户点击分页按钮的时候会出发，这个自定义事件回调，会把用户选中的当前页数注入到回调 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          style="textalign: center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- SpuForm结构:添加类|修改类的解构 -->
      <SpuForm
        v-show="scene == 1"
        @changeScene="scene = $event"
        ref="spu"
        @save="save"
      />
      <!-- SkuForm结构:添加类的实例 -->
      <SkuForm
        v-show="scene == 2"
        @quxiao="scene = $event"
        ref="sku"
        @save="scene = $event"
      />
    </el-card>
    <el-dialog
      :title="spu.spuName"
      :visible.sync="dialogTableVisible"
      :before-close="close"
    >
      <el-table :data="skuList" v-loading="loading">
        <el-table-column
          property="skuName"
          label="名称"
          width="150"
        ></el-table-column>
        <el-table-column
          property="price"
          label="价格"
          width="200"
        ></el-table-column>
        <el-table-column property="weight" label="重量"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row, $index }">
            <img :src="row.skuDefaultImg" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
//非路由组件:定义、注册、使用
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      loading: true,
      //控制对话框的显示与隐藏
      dialogTableVisible: false,
      //三级联动商品分类接受的ID
      category1Id: "",
      category2Id: "",
      category3Id: "",
      //为了将来三级联动控制可用或者不可使用的属性
      //默认参数
      page: 1,
      limit: 3,
      total: 0, //将来接受服务器返回数据【SPU类的总个数】
      spuList: [], //将来接受服务器返回SPU（类）全部的数据
      scene: 0, //0 SPU列表展示结构  1 修改|添加SPU（类）  2：添加SKU（类的实例）
      spu: {},
      skuList: [],
    };
  },
  methods: {
    //对话框关闭按钮的回调
    close() {
      //数据清除
      this.skuList = [];
      //将loading变为true
      this.loading = true;
      //关闭对话框
      this.dialogTableVisible = false;
    },
    //展示SKU列表的按钮的回调
    async showSkuList(row) {
      this.dialogTableVisible = true;
      this.spu = row;
      let result = await this.$api.product.spu.reqSkuList(row.id);
      if (result.code == 200) {
        this.skuList = result.data;
        //loading变为false
        this.loading = false;
      }
    },

    //点击添加SKU按钮的回调
    toSkuForm(row) {
      //修改当前场景---2
      this.scene = 2;
      this.$refs.sku.initSkuFormData(this.category1Id, this.category2Id, row);
    },
    //删除SPU（类的）操作
    async deleteSpuById(row) {
      let result = await this.$api.product.spu.reqDeleteSpuById(row.id);
      if (result.code == 200) {
        this.getSpuList();
      }
    },
    //父组件的save方法，接受子组件传递数据
    save({ scene, addOrUpdate }) {
      this.scene = scene;
      //如果是添加|当父组件拉去第一页的类的信息
      if (addOrUpdate == "添加") {
        this.getSpuList();
      } else {
        //如果是修改停留在当前页
        this.getSpuList(this.page);
      }
    },
    //三级联动的自定义事件
    getDataByCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        this.category3Id = categoryId;
        //获取SPU列表展示
        this.getSpuList();
      }
    },
    //获取SPU列表数据
    async getSpuList(pages = 1) {
      this.page = pages;
      //整理参数
      const { page, limit, category3Id } = this;
      //发请求
      let result = await this.$api.product.spu.reqSpuList(
        page,
        limit,
        category3Id
      );
      if (result.code == 200) {
        this.total = result.data.total;
        this.spuList = result.data.records;
      }
    },
    //当分页器某一个需要展示的条数发生变化的时候回调
    handleSizeChange(limit) {
      //修改参数，再次发请求
      this.limit = limit;
      this.getSpuList();
    },
    //添加SPU按钮的回调
    addSpu() {
      //切换场景
      this.scene = 1;
      //通知子组件发请求----2个
      this.$refs.spu.initAddFormData(this.category3Id);
    },
    //修改Spu按钮的回调
    //row:当前某一个类SPU
    updateSpu(row) {
      this.scene = 1;
      //在父组件内部获取子组件实例：获取到子组件的方法|属性
      this.$refs.spu.initSpuFormData(row, this.category3Id);
    },
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>

<style scoped></style>
