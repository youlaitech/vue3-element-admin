import { Directive, DirectiveBinding } from 'vue';

/**
 * 按钮防抖
 */
export const deBounce:Directive = {
  mounted(el:HTMLElement) {
    el.addEventListener('click', e => {
      el.classList.add('is-disabled')
      setTimeout(() => {
        el.classList.remove('is-disabled')
      }, 2000)
    })
  }
}
