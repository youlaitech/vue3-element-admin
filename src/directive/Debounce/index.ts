import { Directive } from 'vue';

/**
 * 按钮防抖
 */
export const deBounce: Directive = {
  mounted(el: HTMLElement) {
    el.addEventListener('click', () => {
      el.classList.add('is-disabled');
      setTimeout(() => {
        el.classList.remove('is-disabled');
      }, 2000);
    });
  }
};
