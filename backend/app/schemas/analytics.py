from pydantic import BaseModel


class TailAnalysisResponse(BaseModel):
    summary: dict
    table: list
    chart: dict


class SpaceElasticityResponse(BaseModel):
    table: list
    chart: dict


class HeatmapResponse(BaseModel):
    zones: list
