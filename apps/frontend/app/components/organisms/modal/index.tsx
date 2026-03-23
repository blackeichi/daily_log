import { modalAtom } from "@/app/libs/atom";
import { useAtom } from "jotai";
import { memo } from "react";
import Overlay from "../../atoms/overlay";
import { MODAL_STATE } from "@/app/constants/system";
import dynamic from "next/dynamic";

const ModifyLogModal = dynamic(() => import("../modal/modifyLogModal"), {
  ssr: false,
});
const ModifyCaloriesModal = dynamic(
  () => import("../modal/modifyCaloriesModal"),
  {
    ssr: false,
  },
);
const ModifyOverallModal = dynamic(
  () => import("../modal/modifyOverallModal"),
  {
    ssr: false,
  },
);

const Modal = () => {
  const [modal, setModal] = useAtom(modalAtom);
  const onClose = () => {
    setModal(null);
  };
  return (
    <Overlay isOpen={!!modal?.id} onClick={onClose}>
      {modal?.id && modal?.callBack && modal?.id === MODAL_STATE.ADD_LOG && (
        <ModifyLogModal
          isEdit={false}
          callBack={modal.callBack as () => void}
          onClose={onClose}
        />
      )}
      {modal?.id && modal?.callBack && modal?.id === MODAL_STATE.EDIT_LOG && (
        <ModifyLogModal
          isEdit
          id={modal.data as number}
          callBack={modal.callBack as () => void}
          onClose={onClose}
        />
      )}
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
      {modal?.id &&
        (modal?.data as string | undefined) &&
        modal?.callBack &&
        (modal?.id === MODAL_STATE.EDIT_OVERALL ||
          modal?.id === MODAL_STATE.ADD_OVERALL) && (
          <ModifyOverallModal
            isEdit={modal?.id === MODAL_STATE.EDIT_OVERALL}
            date={modal.data as string}
            callBack={modal.callBack as () => void}
            onClose={onClose}
          />
        )}
    </Overlay>
  );
};

export default memo(Modal);
