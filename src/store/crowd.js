import remote from '../utils/remote'

/**
 * 众筹数据集合
 */
const mod = {
    namespaced: true, //独立命名空间

    /**
     * 状态集
     */
    state: {
        list: [],           //众筹条目缓存列表
        pageMax: 1,         //网络获取的最大页数
        configList: [],     //配置信息列表形式
        configDict: {},     //配置信息属性对象形式
    },
    getters: {
        list: (state) => {
            return state.list;
        },
    },
    /**
     * 状态修改函数，必须是同步函数
     * @description 更改状态的唯一方法是提交 mutation: this.$store.commit
     */
    mutations: {
        configChanged(state, msg) {
            state.configList = msg;
            state.configDict = msg.reduce((sofar,cur)=>{
                sofar[cur.payType] = cur;
                return sofar;
              }, {});
        }, 
        setPage(state, page) {
            state.pageMax = page;
        },
        clear(state) {
            state.list = [];
            state.pageMax = 1;
        },
        add(state, msg) {
            state.list.push(msg);
        },
        merge(state, list) {
            state.list = state.list.concat(list);
        }
    },  
    /**
     * 交互函数，可以是同步或者异步函数，可以完全封装状态修改函数(就像 React 的做法)
     * 在交互函数内部还可以继续 context.dispatch 或者 context.commit, 可以使用 await 语法
     * @description actions 类似于mutations, 不过Action 提交的是 mutation，而不是直接变更状态,而且可以包含任意异步操作: this.$store.dispatch
     */
    actions: {
        async getConfig (context) {
            return new Promise((resolve, reject) => {
                context.dispatch('config/pull', {file:'crowd'}, {root: true}).then(res=>{
                    if(res.code == 0) {
                        context.commit('configChanged', res.data);
                        resolve(res.data);
                    } else {
                        reject();
                    }
                });
            });
        },
        clear(context) {
            context.commit('clear');
        },
        merge(context, list) {
            context.commit('merge', list);
        },
        /**
         * 从网络获取内容追加至列表
         * @param {*} context 
         */
        async pull(context) {
            let curPage = ((context.state.list.length/10)|0) + 1;
            if(context.state.list.length%10==0) {
                curPage--;
            }

            if(curPage < context.state.pageMax) {
                let res = await remote.fetching({
                    func: "stockMgr.getCrowdList", 
                    page: curPage+1,
                });
                if (res.code == 0) {
                    //设定最大页数
                    if(context.state.pageMax != res.data.total) {
                        context.commit('setPage', res.data.total);
                    }

                    let qryPage = Math.min(res.data.total, res.data.page); //数据修复：查询页数不能大于总页数
                    if(curPage < qryPage) { //说明获得了新的内容
                        console.log('crowd.pull', res.data.list);
                        res.data.list.forEach(item => {
                            if(typeof item.pic_urls == 'string') {
                                item.pic_urls = JSON.parse(item.pic_urls);
                            }
                            item.percent2 = (((item.sum - item.sum_left) * 100 / item.sum)|0);
                        });
                        context.commit('merge', res.data.list);
                    }
                }
            }

            return curPage < context.state.pageMax;
        },
    },     
}

export default mod;
