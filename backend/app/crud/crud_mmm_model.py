from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.mmm_model import MMMModel, ModelResult, ModelComparison, EnsembleModel
from app.schemas.mmm import MMMModelCreate, MMMModelUpdate


class CRUDMMMModel(CRUDBase[MMMModel, MMMModelCreate, MMMModelUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[MMMModel]:
        return (
            db.query(self.model)
            .filter(MMMModel.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_user_and_type(
        self, db: Session, *, user_id: str, model_type: str
    ) -> List[MMMModel]:
        return (
            db.query(self.model)
            .filter(MMMModel.user_id == user_id)
            .filter(MMMModel.model_type == model_type)
            .all()
        )


class CRUDModelResult(CRUDBase[ModelResult, dict, dict]):
    def get_by_model_id(self, db: Session, *, model_id: str) -> Optional[ModelResult]:
        return db.query(self.model).filter(ModelResult.model_id == model_id).first()


class CRUDModelComparison(CRUDBase[ModelComparison, dict, dict]):
    def get_multi_by_user(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[ModelComparison]:
        return (
            db.query(self.model)
            .filter(ModelComparison.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


class CRUDEnsembleModel(CRUDBase[EnsembleModel, dict, dict]):
    def get_multi_by_user(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[EnsembleModel]:
        return (
            db.query(self.model)
            .filter(EnsembleModel.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


mmm_model = CRUDMMMModel(MMMModel)
model_result = CRUDModelResult(ModelResult)
model_comparison = CRUDModelComparison(ModelComparison)
ensemble_model = CRUDEnsembleModel(EnsembleModel)
