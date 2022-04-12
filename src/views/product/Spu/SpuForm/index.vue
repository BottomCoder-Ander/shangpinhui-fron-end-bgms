<template>
  <div>
    <!-- <h1>{{ unSelectSaleAttrList }}</h1> -->
    <!-- 表单 -->
    <el-form ref="form" label-width="80px" :model="SpuInfo">
      <el-form-item label="SPU名称">
        <el-input v-model="SpuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="SpuInfo.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder="SPU描述"
          v-model="SpuInfo.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          :action="$api.uploadUrl"
          :on-success="handlerSuccess"
          list-type="picture-card"
          :file-list="imageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <!-- 下拉框 -->
        <el-select
          v-model="attrIdAndName"
          :placeholder="
            unSelectSaleAttrList.length == 0
              ? '没有什么可以选择的啦'
              : `还未选择的${unSelectSaleAttrList.length}个`
          "
        >
          <el-option
            :label="saleAttr.name"
            :value="`${saleAttr.id}:${saleAttr.name}`"
            v-for="(saleAttr, index) in unSelectSaleAttrList"
            :key="saleAttr.id"
          ></el-option>
        </el-select>
        <!-- 按钮 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSpuSaleAttr"
          :disabled="!attrIdAndName"
          >添加销售属性值</el-button
        >
        <!-- 表格 -->
        <el-table style="width: 100%" border :data="SpuInfo.spuSaleAttrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="saleAttrName"
            label="属性名"
            width="150px"
          ></el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <!--  -->
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                style="margin: 10px"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
                >{{ tag.saleAttrValueName }}</el-tag
              >
              <!-- @keyup.enter.native="handleInputConfirm"  -->
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(row)"
              ></el-input>
              <!-- @click="showInput" -->
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >新增属性值</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150px">
            <template slot-scope="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="SpuInfo.spuSaleAttrList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      //照片墙需要用的属性---图片地址
      dialogImageUrl: "",
      //控制对话框是否可见
      dialogVisible: false,
      //修改:SpuInfo这个字段，起始数值为空对象，服务器返回数据成功，把空对象变为服务器返回的那个对象（带有ID的）
      //新增：Spuinfo这个字段，就是一个空对象的（新增需要收集数据：需要知道服务器需要字段）
      SpuInfo: {
        category3Id: 0,
        tmId: "",
        spuName: "",
        description: "",
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0
          // }
        ],
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0
          //     }
          //   ]
          // }
        ],
      },
      //品牌的信息
      tradeMarkList: [],
      //SPU（类）的图片数据
      imageList: [],
      //平台全部的销售属性
      saleAttrList: [],
      //收集销售属性ID，但是到时候用不用不确定
      attrIdAndName: "",
    };
  },
  methods: {
    //添加按钮的时候，获取服务器数据
    async initAddFormData(category3Id) {
      this.SpuInfo.category3Id = category3Id;
      //获取品牌的数据
      let TradeMarkResult = await this.$api.product.spu.reqTradeMarkList();
      if (TradeMarkResult.code == 200) {
        this.tradeMarkList = TradeMarkResult.data;
      }
      //获取品牌全部销售属性-----3个
      let saleAttrResult = await this.$api.product.spu.reqSaleAttrList();
      if (saleAttrResult.code == 200) {
        this.saleAttrList = saleAttrResult.data;
      }
    },
    //取消按钮回调
    cancel() {
      //通知父组件修改scene
      this.$emit("changeScene", 0);
      //清空数组
      Object.assign(this._data, this.$options.data());
    },
    //保存按钮:添加SPU|修改SPU
    async addOrUpdateSpu() {
      //整理参数
      const { imageList, SpuInfo } = this;
      //带给服务器图片的字段收集 {imageName||imageUrl}
      //已有图片自带ID，但是新的图片不需要带id
      SpuInfo.spuImageList = imageList.map((item) => {
        return {
          imageName: item.name,
          imgUrl: (item.response && item.response.data) || item.url,
        };
      });
      //发请求(可能是修改|新增)
      let result = await this.$api.product.spu.reqAddOrUpdateSpu(SpuInfo);
      if (result.code == 200) {
        //通知组件
        this.$notify({
          title: "提示",
          message: "保存SPU成功",
          duration: 1000,
        });
        //通知父亲修改场景  ----0
        this.$emit("save", {
          scene: 0,
          addOrUpdate: SpuInfo.id ? "修改" : "添加",
        });
      }
      //清除数据
      //ES6中新增的方法，可以把多个对象进行合并
      //一个一个清空也可以，麻烦
      Object.assign(this._data, this.$options.data());
    },
    //销售属性值中input的失却焦点事件
    handleInputConfirm(row) {
      const { baseSaleAttrId, inputValue } = row;
      //1:属性值不能为空的
      if (inputValue.trim() == "") {
        this.$message("添加的属性值不能为空");
        return;
      }
      //新增的属性值不能重复
      let noRepeat = row.spuSaleAttrValueList.every(
        (item) => item.saleAttrValueName != inputValue
      );
      //添加的属性值没有重复
      if (noRepeat) {
        //向某一个销售属性的属性值列表的数组添加一个新的属性值
        let newSaleValue = {
          baseSaleAttrId,
          saleAttrValueName: inputValue,
        };
        row.spuSaleAttrValueList.push(newSaleValue);
        //切换input变为button
        row.inputVisible = false;
      } else {
        //重复
        this.$message("亲爱的再选一个");
      }
    },
    //收集销售是属性值的操作（新增属性值按钮的回调）
    showInput(row) {
      //给销售属性添加inputVisible，切换input与button操作
      this.$set(row, "inputVisible", true);
      //收集销售属性值的K
      this.$set(row, "inputValue", "");

      //聚焦
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    //点击添加销售属性按钮的回调函数
    addSpuSaleAttr() {
      //先整理为一个对象
      let [baseSaleAttrId, saleAttrName] = this.attrIdAndName.split(":");
      let saleAttrObj = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      //向给服务器提交数据的对象，添加新的数据
      this.SpuInfo.spuSaleAttrList.push(saleAttrObj);
      //清空数据
      this.attrIdAndName = "";
    },
    //照片墙上传图片成功
    handlerSuccess(response, file, fileList) {
      //图片上传成功收集全部图片的信息
      this.imageList = fileList;
    },
    //照片墙图片删除的回调
    //第一个参数：删除那张图片
    //第二个参数：删除过后剩余图片
    handleRemove(file, fileList) {
      console.log(file, fileList);
      // 组件实例收集照片墙剩余的图片的信息
      this.imageList = fileList;
    },
    //点击加号（照片墙的回调）
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //初始化Spu数据信息----四个请求
    async initSpuFormData(spu, category3Id) {
      //当父亲调用子组件方法的时候，3id带过来，收集到
      this.SpuInfo.category3Id = category3Id;
      //获取类的信息---id
      let SpuInfoResult = await this.$api.product.spu.reqSpuInfo(spu.id);
      //服务器相应成功返回的对象组件实例进行存储
      if (SpuInfoResult.code == 200) {
        this.SpuInfo = SpuInfoResult.data;
      }
      //获取品牌的数据
      let TradeMarkResult = await this.$api.product.spu.reqTradeMarkList();
      if (TradeMarkResult.code == 200) {
        this.tradeMarkList = TradeMarkResult.data;
      }
      //获取某一个类（SPU）图片的信息
      let imageListResult = await this.$api.product.spu.reqSupImageList(spu.id);
      if (imageListResult.code == 200) {
        let listArr = imageListResult.data;
        listArr.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        //数组替换
        this.imageList = listArr;
      }
      //获取品牌全部销售属性-----3个
      let saleAttrResult = await this.$api.product.spu.reqSaleAttrList();
      if (saleAttrResult.code == 200) {
        this.saleAttrList = saleAttrResult.data;
      }
    },
  },
  computed: {
    //为选择的销售属性
    unSelectSaleAttrList() {
      //从全部销售属性里面（3）筛选出两个销售属性
      //一共销售属性：颜色、版本、尺寸           SPU:[尺寸]
      return this.saleAttrList.filter((item) => {
        return this.SpuInfo.spuSaleAttrList.every((item1) => {
          return item.name != item1.saleAttrName;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: center;
}
</style>
