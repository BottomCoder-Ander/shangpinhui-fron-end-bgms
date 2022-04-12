//负责品牌的接口
import request from "@/utils/request";
//获取品牌列表的数据
export const reqTradeMarkList = (page, limit) =>
  request({
    url: `/admin/product/baseTrademark/${page}/${limit}`,
    method: "get",
  });

//具体业务不要写在这里，所以这里两个分开
//新增品牌
export const reqAddTradeMark = (trademark) =>
  request({
    url: "/admin/product/baseTrademark/update",
    data: trademark,
    method: "put",
  });
//修改某一个品牌
export const reqUpdateTradeMark = (trademark) =>
  request({
    url: "/admin/product/baseTrademark/save",
    data: trademark,
    method: "post",
  });

//删除品牌
export const reqDeleteTradeMarkById = (id) =>
  request({
    url: `/admin/product/baseTrademark/remove/${id}`,
    method: "delete",
  });
