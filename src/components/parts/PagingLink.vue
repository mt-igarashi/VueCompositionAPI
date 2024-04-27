<template>
  <div v-if="total > 0" class="nav-links">
    <a v-if="prevPegeSize > 0 && prevPegeSize < total" class="prev page-numbers" href="#" @click.prevent="reloadPage(pageNumber - 1, pageSize)">«</a>
    <a v-else class="prev page-numbers" href="#" @click.prevent="">«</a>
    <template v-for="status in totalPage" :key="status.id">
      <span v-if="status.number == pageNumber" class="page-numbers current">{{status.number + 1}}</span>
      <a v-else class="page-numbers" href="#" @click.prevent="reloadPage(status.number, pageSize)">{{status.number + 1}}</a>
    </template>
    <a v-if="nextPegeSize < total" class="page-numbers" href="#" @click.prevent="reloadPage(pageNumber + 1, pageSize)">»</a>
    <a v-else class="next page-numbers" href="#" @click.prevent="">»</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import router from "@/route"
import { LinkPage} from "@/js/commonType";

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // ページ数
    pageNumber: {
      required: true,
      type: Number
    },

    // ページサイズ
    pageSize: {
      required: true,
      type: Number
    },

    // 合計件数
    total: {
      required: true,
      type: Number
    },

    // 遷移先
    name: {
      required: true,
      type: String
    },

    // 遷移先パラメータ
    linkparams: {
      type: Object
    }
});

/*
 * VueRouterのインスタンス
 */
const isRouterReady = async () => {
    await router.isReady();
};

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */

  /*
   * 関数概要: ページを再読み込みします。
   * 引数：page ページ数、size ページサイズ
   */
  const reloadPage = (page:number, size:number):void => {
    let params = props.linkparams ?? {};
    router.push({name: props.name, params: params, query: {pageNumber: page, pageSize: size}});
  };

/*
 * 概要: 算出プロパティ(キャッシュされるので変更不可。ただしリアクティブデータは変更されると再計算される)
 *       リアクティブデータであるかVueが判断できない場合の更新を防ぐため
 *       値が変わらない場合はできるだけこちらを使う
 */

  /*
   * 関数概要: 合計ページ数を返却します。
   */
  const totalPage = computed(():LinkPage[] => {
    let count = Math.ceil(props.total / props.pageSize);
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push({id: i.toString(), number: i});
    }
    return result;
  });

  /*
   * 関数概要: 前ページまでの合計ページサイズを返却します。
   */
  const prevPegeSize = computed(():number => {
    return ((props.pageNumber - 1) * props.pageSize) + props.pageSize;
  });

  /*
   * 関数概要: 次ページまでの合計ページサイズを返却します。
   */
  const nextPegeSize = computed(():number => {
    return (props.pageNumber * props.pageSize) + props.pageSize;
  });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.nav-links{
  margin-top: 4px;
  padding: 1px;
  display: flex;
  justify-content: center;
  background: #f3f3f3;
}
a,span{
  width: 50px;
  height: 50px;
  margin: 2px;
  line-height: 50px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
  background: #fff;
  color: #222;
  transition: .3s;
}
a:hover{
  background: gold;
  border-radius: 100%;
  transform: rotate(360deg);
}
.current{
  background: gold;
  border-radius: 100%;
}
.dots{
  background: none;
}
</style>
