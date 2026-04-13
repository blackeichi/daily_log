import { modalAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { memo } from "react";
import Overlay from "../../atoms/overlay";
import { MODAL_STATE } from "@/constants/system";
import dynamic from "next/dynamic";

const ModifyLogModal = dynamic(() => import("./logModal/modifyLogModal"), {
  ssr: false,
});
const ViewLogModal = dynamic(() => import("./logModal/viewLogModal"), {
  ssr: false,
});
const ModifyCaloriesModal = dynamic(() => import("./modifyCaloriesModal"), {
  ssr: false,
});

const Modal = () => {
  const [modal, setModal] = useAtom(modalAtom);
  const onClose = () => {
    setModal(null);
  };
  return (
    <Overlay isOpen={!!modal?.id} onClick={onClose}>
      {modal?.id &&
        (modal?.id === MODAL_STATE.EDIT_LOG ||
          modal?.id === MODAL_STATE.ADD_LOG) && (
          <ModifyLogModal
            isEdit={modal?.id === MODAL_STATE.EDIT_LOG}
            id={
              modal?.id === MODAL_STATE.EDIT_LOG
                ? (modal.data as number)
                : undefined
            }
            onClose={onClose}
          />
        )}
      {modal?.id &&
        modal?.id === MODAL_STATE.VIEW_LOG &&
        (() => {
          const { id, title } = modal.data as { id: number; title: string };
          return <ViewLogModal id={id} title={title} onClose={onClose} />;
        })()}
      {modal?.id &&
        (modal?.data as string | undefined) &&
        modal?.callBack &&
        (modal?.id === MODAL_STATE.EDIT_CALORIES ||
          modal?.id === MODAL_STATE.ADD_CALORIES) && (
          <ModifyCaloriesModal
            isEdit={modal?.id === MODAL_STATE.EDIT_CALORIES}
            date={modal.data as string}
            callBack={modal.callBack as () => void}
            onClose={onClose}
          />
        )}
    </Overlay>
  );
};

export default memo(Modal);
