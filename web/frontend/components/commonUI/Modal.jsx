import { Modal } from "@shopify/polaris";
import { useUI } from "../../contexts/ui.context";
import ProductSeo from "../ProductSeo";
import CollectionSeo from "../CollectionSeo";
import ArticlesPage from "../Articles";
import ArticleSeo from "../ArticleSeo";
import CreateBlog from "../CreateBlog";

export function ModalArea() {
  const { modal, setCloseModal } = useUI();
  return (
    <Modal
      large
      open={modal?.isOpen}
      onClose={setCloseModal}
      title={modal?.data?.title || "Modal"}
    >
      <Modal.Section>
        {modal?.view === "CREATE_PRODUCT_SEO" && <ProductSeo />}
        {modal?.view === "CREATE_COLLECTION_SEO" && <CollectionSeo />}
        {modal?.view === "BLOG_SEO" && <ArticlesPage />}
        {modal?.view === "ARTICLE_SEO" && <ArticleSeo />}
        {modal?.view === "BLOG_CREATE" && <CreateBlog />}
      </Modal.Section>
    </Modal>
  );
}
