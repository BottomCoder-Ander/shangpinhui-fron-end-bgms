//将product的接口统一暴露
import * as trademark from "./trademark";
import * as attr from "./attr";
import * as spu from "./spu";
// 注意写法的区别，在sku中使用export default
import sku from "./sku";

export default { trademark, attr, spu, sku };
