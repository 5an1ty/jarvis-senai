"""Extension boundary: adapters must acknowledge execution; never optimistic success."""
from typing import Protocol, Any
from dataclasses import dataclass

@dataclass(frozen=True)
class Acknowledgement:
    confirmed: bool
    state: dict[str, Any]
    error: str | None = None

class DeviceAdapter(Protocol):
    async def execute(self, external_id: str, action: str, parameters: dict) -> Acknowledgement: ...

class HomeAssistantAdapter:
    """Contract placeholder. Configure authenticated HTTPS integration before enabling."""
    async def execute(self, external_id: str, action: str, parameters: dict) -> Acknowledgement:
        return Acknowledgement(False, {}, 'Home Assistant não configurado')

class MQTTAdapter:
    """Future implementation requires TLS, scoped topics and correlated ACK timeout."""
    async def execute(self, external_id: str, action: str, parameters: dict) -> Acknowledgement:
        return Acknowledgement(False, {}, 'MQTT não configurado')
