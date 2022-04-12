<template>
  <div>
    <el-form ref="form" label-width="80px" :model="skuInfo">
      <el-form-item label="SPU名称">
        {{ spu.spuName }}
      </el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          placeholder="价格(元)"
          type="number"
          v-model="skuInfo.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input
          placeholder="重量(千克)"
          type="number"
          v-model="skuInfo.weight"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          placeholder="规格描述"
          rows="4"
          v-model="skuInfo.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" ref="form" label-width="100px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, index) in attrList"
            :key="attr.id"
          >
            <el-select placeholder="请选择" v-model="attr.attrIdAndValueId">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="(attrValue, index) in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item
            :label="sale.saleAttrName"
            v-for="(sale, index) in saleList"
            :key="sale.id"
          >
            <el-select placeholder="请选择" v-model="sale.saleIdAndValueId">
              <el-option
                :label="saleValue.saleAttrValueName"
                :value="`${sale.id}:${saleValue.id}`"
                v-for="(saleValue, index) in sale.spuSaleAttrValueList"
                :key="saleValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          style="width: 100%"
          border
          :data="skuImageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="80"></el-table-column>
          <el-table-column label="图片" width="width">
            <template slot-scope="{ row, $index }">
              <img :src="row.imgUrl" style="width: 100px; height: 100px" />
            </template>
          </el-table-column>
          <el-table-column
            prop="imgName"
            label="名称"
            width="width"
          ></el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="primary"
                size="mini"
                v-if="row.isDefault == 0"
                @click="changeDefault(row, skuImageList)"
                >设置默认</el-button
              >
              <el-tag type="success" v-else>默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('quxiao', 0)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      //平台属性（数组），将来接受服务器返回数据
      attrList: [],
      //销售属性(数组)，将来接受服务器返回的数据
      saleList: [],
      //图片列表,将来接受服务器返回的数据
      skuImageList: [],
      //收集SKU数据，将来提交给服务武新增的某一个实例
      skuInfo: {
        //父组件传递过来的数据
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        //第二类v-model
        skuName: "",
        price: 0,
        weight: "",
        skuDesc: "",
        //需要自己书写代码收集的
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   valueId: 0,
          // }
        ],
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0
          // }
        ],
        skuSaleAttrValueList: [
          // {
          //   saleAttrId: 0,
          //   saleAttrValueId: 0,
          // }
        ],
      },
      spu: {},
      //收集用户选中图片信息---缺少字段（将来整理的）
      imageList: [],
    };
  },
  methods: {
    //SKU子组件的方法----发请求获取数据
    async initSkuFormData(category1Id, category2Id, row) {
      //赋值给当前子组件spu
      this.spu = row;
      let promise1 = this.$api.product.spu.reqAttrList(
        category1Id,
        category2Id,
        row.category3Id
      );
      let promise2 = this.$api.product.spu.reqSalesAttrList(row.id);
      let promise3 = this.$api.product.spu.reqSpuImageList(row.id);
      //promise.all只要有一个失败即为失败（全部成功即为成功）
      let result = await Promise.all([promise1, promise2, promise3]);
      //存储数据----将来需要展示
      if (result[0].code == 200) {
        this.attrList = result[0].data;
      }

      if (result[1].code == 200) {
        this.saleList = result[1].data;
      }

      if (result[2].code == 200) {
        let skuImageList = result[2].data;
        //给服务器返回的数据添加新的字段isDefault
        skuImageList.forEach((item) => {
          item.isDefault = "0";
        });
        this.skuImageList = skuImageList;
      }
    },
    //table的复选框勾选回调
    //imageList:勾选的图片
    handleSelectionChange(imageList) {
      this.imageList = imageList;
    },
    //设置默认图片的排他操作
    changeDefault(row, skuImageList) {
      skuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    //保存
    async save() {
      //整理参数
      this.skuInfo.category3Id = this.spu.category3Id;
      this.skuInfo.tmId = this.spu.tmId;
      this.skuInfo.spuId = this.spu.id;
      //整理平台属性
      const { skuInfo, attrList, saleList, imageList } = this;
      //收集平台属性
      skuInfo.skuAttrValueList = attrList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          let [attrId, valueId] = item.attrIdAndValueId.split(":");
          prev.push({ attrId, valueId });
        }
        return prev;
      }, []);
      //销售属性
      skuInfo.skuSaleAttrValueList = saleList.reduce((prev, item) => {
        if (item.saleIdAndValueId) {
          let [saleAttrId, saleAttrValueId] = item.saleIdAndValueId.split(":");
          prev.push({ saleAttrId, saleAttrValueId });
        }
        return prev;
      }, []);

      //图片的整理
      skuInfo.skuImageList = imageList.map((item) => {
        return {
          imageName: item.imageName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });

      //发请求
      let result = await this.$api.product.spu.reqSaveSkuInfo(skuInfo);
      //成功干什么
      //失败干什么
      if (result.code == 200) {
        this.$message("保存SKU成功");
        this.$emit("save", 0);
      }
    },
  },
};
</script>

<style scoped></style>
