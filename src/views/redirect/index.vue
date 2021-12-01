<script lang="ts">
import {defineComponent} from "vue";
import {useRoute, useRouter} from "vue-router";

export default defineComponent({
  created() {
    const {params, query} = useRoute()
    const {path} = params
    useRouter().replace({path: '/' + path, query})
  },
  render() {
  }
})
</script>
