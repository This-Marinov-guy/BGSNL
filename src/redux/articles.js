import { createSlice } from "@reduxjs/toolkit";
import { LEGACY_ARTICLES } from "../util/defines/ARTICLES";

export const articlesSlice = createSlice({
  name: "articles",
  initialState: {
    all: [],
    selected: null,
    loading: {
      all: true,
      single: true,
    },
  },
  reducers: {
    loadSingleArticle: (state, action) => {
      state.selected = action.payload;
    },

    loadArticles: (state, action) => {
      state.all = []; 
      action.payload.forEach((article) => state.all.push(article));
      state.all.push(...LEGACY_ARTICLES);
    },

    startLoadingAll: (state) => {
      state.loading.all = true;
    },

    stopLoadingAll: (state) => {
      state.loading.all = false;
    },
  },
});

export const selectArticles = (state) => state.articles.all;
export const selectSingleArticle = (state) => state.articles.selected;
export const {
  loadSingleArticle,
  loadArticles,
  startLoadingAll,
  stopLoadingAll,
} = articlesSlice.actions;
export default articlesSlice.reducer;
