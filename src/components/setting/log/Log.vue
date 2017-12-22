<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_log_download"></i> 日志下载</div>
      </div>
      <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
        <el-tabs type="card" @tab-click="getData" v-model="activeName">
          <el-tab-pane label="系统日志" name="tomcat">
            <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" width="300">
              </el-table-column>
              <el-table-column prop="fileTime" sortable label="创建时间" width="200">
              </el-table-column>
              <el-table-column prop="fileLenth" sortable label="文件大小" width="240">
              </el-table-column>
              <el-table-column :context="_self" inline-template label="操作">
                <span>
                  <el-button type="primary" size="mini" @click="() => download(row.filePath, row.fileName)"><i class="fa fa-download"></i> 下载</el-button>
                </span>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane label="蓝桥日志" name="bridge">
            <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" width="300">
              </el-table-column>
              <el-table-column prop="fileTime" sortable label="创建时间" width="200">
              </el-table-column>
              <el-table-column prop="fileLenth" sortable label="文件大小" width="240">
              </el-table-column>
              <el-table-column :context="_self" inline-template label="操作">
                <span>
                  <el-button type="primary" size="mini" @click="() => download(row.filePath, row.fileName)"><i class="fa fa-download"></i> 下载</el-button>
                </span>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane label="数据库备份" name="database">
            <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" width="300">
              </el-table-column>
              <el-table-column prop="fileTime" sortable label="创建时间" width="200">
              </el-table-column>
              <el-table-column prop="fileLenth" sortable label="文件大小" width="240">
              </el-table-column>
              <el-table-column :context="_self" inline-template label="操作">
                <span>
                  <el-button type="primary" size="mini" @click="() => download(row.filePath, row.fileName)"><i class="fa fa-download"></i> 下载</el-button>
                </span>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
              </el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import * as CONST from '../../../const';

export default {
  created() {
    this.loading = true;
    this.getData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      debugger; // eslint-disable-line no-debugger, no-restricted-syntax
      return _.chunk(this.data.filter(item => {
        if (!_this.filterBed) {
          return true;
        }
        return item.bedCode.indexOf(_this.filterBed) > -1;
      }), _this.perPageSize);
    },
    // 过滤后的条目数
    resultSize() {
      let len = 0;

      this.filterdList.forEach(item => len += item.length);

      return len;
    }
  },
  data() {
    return {
      activeName:'tomcat',
      loading: false,
      data: [],
      details: [],
      perPageSize: 10,
      currentPage: 1
    }
  },
  methods: {
    getData(tab, event) {
      // 根据选项卡name来获取数据
      // 默认获取tomcat日志
      let subUrl = 'getTomcatLogs';
      if (tab) {
        switch (tab.name) {
          case 'tomcat':
          break;

          case 'bridge':
          subUrl = 'getBlueBridgeLogs';
          break;

          case 'database':
          subUrl = 'getDbDumpFiles';
          break;

          default:
          break;
        }
      }
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/${subUrl}`).then(response => {
        debugger; // eslint-disable-line no-debugger, no-restricted-syntax
        this.loading = false;
        this.data = response.body.data;
        this.list = _.chunk(this.data, this.perPageSize);
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    download(filePath, fileName) {
      window.open(`${CONST.PATH}/downLoad?url=${filePath}`, fileName);
    }
  }
}
</script>
