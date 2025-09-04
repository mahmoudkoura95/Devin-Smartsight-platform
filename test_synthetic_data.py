#!/usr/bin/env python3
import sys
import os
sys.path.append('/home/ubuntu/repos/smartsight-platform/backend')

from app.utils.synthetic_data import generate_demo_data

def test_synthetic_data():
    print("Testing synthetic data generation...")
    
    data = generate_demo_data(days=7)
    
    print(f"Generated {len(data)} records")
    
    if data:
        sample = data[0]
        print(f"\nSample record:")
        print(f"  Date: {sample.date}")
        print(f"  Channel: {sample.channel}")
        print(f"  Campaign: {sample.campaign_name}")
        print(f"  Spend: ${sample.spend}")
        print(f"  Impressions: {sample.impressions}")
        print(f"  Clicks: {sample.clicks}")
        print(f"  Conversions: {sample.conversions}")
        print(f"  Revenue: ${sample.revenue}")
        
        channels = set([d.channel for d in data])
        print(f"\nChannels: {sorted(channels)}")
        print(f"Total channels: {len(channels)}")
        
        dates = [d.date for d in data]
        print(f"\nDate range: {min(dates)} to {max(dates)}")
        
        total_spend = sum([float(d.spend) for d in data])
        total_revenue = sum([float(d.revenue) for d in data])
        print(f"\nTotal spend: ${total_spend:,.2f}")
        print(f"Total revenue: ${total_revenue:,.2f}")
        print(f"ROAS: {total_revenue/total_spend:.2f}x")
        
    print("\nSynthetic data generation test completed successfully!")

if __name__ == "__main__":
    test_synthetic_data()
