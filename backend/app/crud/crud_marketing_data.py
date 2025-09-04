from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.marketing_data import MarketingData
from app.schemas.marketing_data import MarketingDataCreate, MarketingDataUpdate


class CRUDMarketingData(CRUDBase[MarketingData, MarketingDataCreate, MarketingDataUpdate]):
    def create_with_user(
        self, db: Session, *, obj_in: MarketingDataCreate, user_id: UUID
    ) -> MarketingData:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[MarketingData]:
        return (
            db.query(self.model)
            .filter(MarketingData.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


marketing_data = CRUDMarketingData(MarketingData)
