// 默认导出一个对象，作为打包的配置文件
import bable from "rollup-plugin-babel";
export default {
  // 配置打包入口文件
  input: "./src/index.js",
  //   配置打包出口
  output: {
    file: "./dist/vue.js",
    name: "Vue", //将打包之后的对象挂载到 global 上，即新增一个global.Vue
    format: "umd", //esm es6
    sourcemap: true, // 可以调试源代码
  },
  plugins: [
    bable({
      exclude: "node_modules/**", //排除node_modules下的所有文件和文件夹
    }),
  ],
};
